// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAlvionVault.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AlvionPerpVault
 * @notice Option A: Hybrid CLOB + Single USDC Vault on Avalanche C-Chain
 * @dev Percolator-enhanced architecture:
 *      1. Junior PnL & Source-Domain Risk Firewalls:
 *         Positive PnL on volatile tokens cannot drain the primary USDC vault.
 *      2. Mathematical Solvency Invariants:
 *         Total Assets >= Total Liabilities strictly checked.
 *      3. Fast off-chain matching with on-chain EIP-712 settlement.
 *      4. Up to 100x leverage with 100% USDC collateral & settlement throughout.
 */
contract AlvionPerpVault is IAlvionVault {
    // Avalanche C-Chain Native Circle USDC: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
    IERC20 public immutable usdc;
    address public owner;
    address public sequencer; // Authorized off-chain matching engine address

    // Pricing & Risk Parameters
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant USDC_DECIMALS_FACTOR = 1e12; // scales 6 decimals USDC to 18 decimals
    uint256 public constant MAX_LEVERAGE = 100;
    uint256 public constant MAINTENANCE_MARGIN_BPS = 80; // 0.8%
    uint256 public constant BASE_SPREAD_BPS = 5; // 0.05%
    uint256 public constant TRADING_FEE_BPS = 6; // 0.06%

    // EIP-712 TypeHash
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant ORDER_TYPEHASH = keccak256(
        "Order(address trader,string market,bool isLong,uint256 price,uint256 sizeUsd,uint256 marginUsdc,uint256 leverage,uint256 nonce,uint256 expiry)"
    );

    struct EIP712Order {
        address trader;
        string market;
        bool isLong;
        uint256 price;
        uint256 sizeUsd;
        uint256 marginUsdc;
        uint256 leverage;
        uint256 nonce;
        uint256 expiry;
    }

    // Vault LP Accounting
    uint256 public totalVaultLiquidityUsdc;
    uint256 public totalVaultShares;
    uint256 public totalLockedMarginUsdc;
    mapping(address => uint256) public lpShares;

    // Percolator-inspired: Source-Domain Risk Mapping
    mapping(bytes32 => MarketDomain) public marketDomains;

    // Positions & Markets
    uint256 public nextPositionId = 1;
    mapping(uint256 => Position) public positions;
    mapping(bytes32 => MarketState) public markets;
    mapping(address => uint256[]) public userPositionIds;
    mapping(bytes32 => bool) public executedOrderHashes;

    // Events
    event MatchedOrdersSettled(
        uint256 indexed makerPositionId,
        uint256 indexed takerPositionId,
        address maker,
        address taker,
        bytes32 market,
        uint256 matchPrice,
        uint256 matchSizeUsd
    );

    // Reentrancy guard
    uint256 private _status = 1;

    modifier nonReentrant() {
        require(_status == 1, "REENTRANCY_GUARD");
        _status = 2;
        _;
        _status = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    modifier onlySequencer() {
        require(msg.sender == sequencer || msg.sender == owner, "ONLY_SEQUENCER");
        _;
    }

    // Percolator Invariant: Guarantees conservation of value after state transitions
    modifier verifySolvency() {
        _;
        (bool isSolvent, uint256 assets, uint256 liabilities) = checkSolvencyInvariant();
        require(isSolvent, "SOLVENCY_INVARIANT_VIOLATED");
        emit SolvencyInvariantChecked(assets, liabilities, true);
    }

    constructor(address _usdc, address _sequencer) {
        require(_usdc != address(0), "INVALID_USDC_ADDRESS");
        usdc = IERC20(_usdc);
        owner = msg.sender;
        sequencer = _sequencer != address(0) ? _sequencer : msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("AlvionExchange")),
                keccak256(bytes("1.0")),
                block.chainid,
                address(this)
            )
        );

        // Initialize default Avalanche markets & Junior PnL domain caps
        _initMarketAndDomain("AVAX", 10_000_000 * 1e6, 100, 250_000 * 1e6, 500_000 * 1e6);
        _initMarketAndDomain("BTC", 50_000_000 * 1e6, 100, 1_000_000 * 1e6, 2_000_000 * 1e6);
        _initMarketAndDomain("ETH", 30_000_000 * 1e6, 100, 750_000 * 1e6, 1_500_000 * 1e6);
        _initMarketAndDomain("SOL", 20_000_000 * 1e6, 100, 500_000 * 1e6, 1_000_000 * 1e6);
    }

    function _initMarketAndDomain(
        bytes32 symbol,
        uint256 maxOi,
        uint256 maxLev,
        uint256 domainInsuranceUsdc,
        uint256 maxRealizablePnlCap
    ) internal {
        markets[symbol] = MarketState({
            longOpenInterestUsd: 0,
            shortOpenInterestUsd: 0,
            maxOpenInterestUsd: maxOi,
            baseSpreadBps: BASE_SPREAD_BPS,
            maxLeverage: maxLev,
            isActive: true
        });

        marketDomains[symbol] = MarketDomain({
            isolatedInsuranceUsdc: domainInsuranceUsdc,
            maxRealizablePnlCap: maxRealizablePnlCap,
            currentRealizedPnl: 0,
            epochStartTimestamp: block.timestamp
        });
    }

    // ==========================================
    // OPTION A: HYBRID CLOB EIP-712 SETTLEMENT
    // ==========================================

    function settleMatchedOrders(
        EIP712Order calldata makerOrder,
        bytes calldata makerSig,
        EIP712Order calldata takerOrder,
        bytes calldata takerSig,
        uint256 matchPrice,
        uint256 matchSizeUsd
    ) external onlySequencer nonReentrant verifySolvency returns (uint256 makerPosId, uint256 takerPosId) {
        require(block.timestamp <= makerOrder.expiry, "MAKER_ORDER_EXPIRED");
        require(block.timestamp <= takerOrder.expiry, "TAKER_ORDER_EXPIRED");
        require(makerOrder.isLong != takerOrder.isLong, "ORDERS_SAME_DIRECTION");

        bytes32 makerHash = hashOrder(makerOrder);
        bytes32 takerHash = hashOrder(takerOrder);
        require(!executedOrderHashes[makerHash], "MAKER_ORDER_ALREADY_FILLED");

        _verifySignature(makerHash, makerOrder.trader, makerSig);
        _verifySignature(takerHash, takerOrder.trader, takerSig);

        // Collect margin in USDC
        require(usdc.transferFrom(makerOrder.trader, address(this), makerOrder.marginUsdc), "MAKER_MARGIN_FAILED");
        require(usdc.transferFrom(takerOrder.trader, address(this), takerOrder.marginUsdc), "TAKER_MARGIN_FAILED");

        totalLockedMarginUsdc += (makerOrder.marginUsdc + takerOrder.marginUsdc);

        bytes32 marketBytes = bytes32(bytes(makerOrder.market));

        makerPosId = nextPositionId++;
        positions[makerPosId] = Position({
            id: makerPosId,
            trader: makerOrder.trader,
            market: marketBytes,
            isLong: makerOrder.isLong,
            marginUsdc: makerOrder.marginUsdc,
            leverage: makerOrder.leverage,
            sizeUsd: matchSizeUsd,
            entryPrice: matchPrice,
            openTimestamp: block.timestamp,
            isOpen: true
        });

        takerPosId = nextPositionId++;
        positions[takerPosId] = Position({
            id: takerPosId,
            trader: takerOrder.trader,
            market: marketBytes,
            isLong: takerOrder.isLong,
            marginUsdc: takerOrder.marginUsdc,
            leverage: takerOrder.leverage,
            sizeUsd: matchSizeUsd,
            entryPrice: matchPrice,
            openTimestamp: block.timestamp,
            isOpen: true
        });

        emit MatchedOrdersSettled(
            makerPosId,
            takerPosId,
            makerOrder.trader,
            takerOrder.trader,
            marketBytes,
            matchPrice,
            matchSizeUsd
        );
    }

    function hashOrder(EIP712Order calldata order) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        ORDER_TYPEHASH,
                        order.trader,
                        keccak256(bytes(order.market)),
                        order.isLong,
                        order.price,
                        order.sizeUsd,
                        order.marginUsdc,
                        order.leverage,
                        order.nonce,
                        order.expiry
                    )
                )
            )
        );
    }

    function _verifySignature(bytes32 hash, address signer, bytes calldata signature) internal pure {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            assembly {
                r := calldataload(signature.offset)
                s := calldataload(add(signature.offset, 32))
                v := byte(0, calldataload(add(signature.offset, 64)))
            }
            if (v < 27) v += 27;
            address recovered = ecrecover(hash, v, r, s);
            require(recovered == signer && recovered != address(0), "INVALID_EIP712_SIGNATURE");
        }
    }

    // ==========================================
    // LP SINGLE USDC VAULT FUNCTIONS
    // ==========================================

    function depositLiquidity(uint256 usdcAmount) external nonReentrant returns (uint256 sharesMinted) {
        require(usdcAmount > 0, "ZERO_DEPOSIT");
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC_TRANSFER_FAILED");

        if (totalVaultShares == 0 || totalVaultLiquidityUsdc == 0) {
            sharesMinted = usdcAmount;
        } else {
            sharesMinted = (usdcAmount * totalVaultShares) / totalVaultLiquidityUsdc;
        }

        totalVaultShares += sharesMinted;
        totalVaultLiquidityUsdc += usdcAmount;
        lpShares[msg.sender] += sharesMinted;

        emit LiquidityAdded(msg.sender, usdcAmount, sharesMinted);
    }

    function withdrawLiquidity(uint256 shares) external nonReentrant returns (uint256 usdcAmount) {
        require(shares > 0 && lpShares[msg.sender] >= shares, "INVALID_SHARES");

        usdcAmount = (shares * totalVaultLiquidityUsdc) / totalVaultShares;
        lpShares[msg.sender] -= shares;
        totalVaultShares -= shares;
        totalVaultLiquidityUsdc -= usdcAmount;

        require(usdc.transfer(msg.sender, usdcAmount), "USDC_TRANSFER_FAILED");
        emit LiquidityRemoved(msg.sender, shares, usdcAmount);
    }

    // ==========================================
    // MARKET ORDERS (FILL AGAINST SINGLE USDC VAULT)
    // ==========================================

    function openPosition(
        bytes32 market,
        bool isLong,
        uint256 marginUsdc,
        uint256 leverage,
        uint256 oraclePrice,
        uint256 acceptablePrice
    ) external nonReentrant verifySolvency returns (uint256 positionId) {
        MarketState storage m = markets[market];
        require(m.isActive, "MARKET_INACTIVE");
        require(leverage >= 1 && leverage <= m.maxLeverage, "INVALID_LEVERAGE");
        require(marginUsdc >= 10 * 1e6, "MIN_MARGIN_10_USDC");
        require(totalVaultLiquidityUsdc > 0, "INSUFFICIENT_VAULT_LIQUIDITY");

        uint256 sizeUsd = marginUsdc * leverage;
        (uint256 executionPrice, ) = getDynamicExecutionPrice(market, isLong, sizeUsd, oraclePrice);

        if (isLong) {
            require(executionPrice <= acceptablePrice, "SLIPPAGE_EXCEEDED");
            m.longOpenInterestUsd += sizeUsd;
        } else {
            require(executionPrice >= acceptablePrice, "SLIPPAGE_EXCEEDED");
            m.shortOpenInterestUsd += sizeUsd;
        }

        uint256 feeUsdc = (sizeUsd * TRADING_FEE_BPS) / BPS_DENOMINATOR;
        uint256 netMargin = marginUsdc - feeUsdc;
        totalVaultLiquidityUsdc += feeUsdc;
        totalLockedMarginUsdc += netMargin;

        require(usdc.transferFrom(msg.sender, address(this), marginUsdc), "MARGIN_TRANSFER_FAILED");

        positionId = nextPositionId++;
        positions[positionId] = Position({
            id: positionId,
            trader: msg.sender,
            market: market,
            isLong: isLong,
            marginUsdc: netMargin,
            leverage: leverage,
            sizeUsd: sizeUsd,
            entryPrice: executionPrice,
            openTimestamp: block.timestamp,
            isOpen: true
        });

        userPositionIds[msg.sender].push(positionId);

        emit PositionOpened(
            positionId,
            msg.sender,
            market,
            isLong,
            netMargin,
            leverage,
            executionPrice
        );
    }

    /**
     * @notice Close position with Percolator-inspired "Junior PnL" Domain Firewall
     */
    function closePosition(
        uint256 positionId,
        uint256 currentOraclePrice
    ) external nonReentrant verifySolvency returns (int256 netPnlUsdc) {
        Position storage pos = positions[positionId];
        require(pos.isOpen, "POSITION_NOT_OPEN");
        require(pos.trader == msg.sender || msg.sender == owner, "UNAUTHORIZED");

        pos.isOpen = false;
        totalLockedMarginUsdc = totalLockedMarginUsdc.saturating_sub(pos.marginUsdc);

        MarketState storage m = markets[pos.market];
        MarketDomain storage domain = marketDomains[pos.market];

        if (pos.isLong) {
            m.longOpenInterestUsd -= pos.sizeUsd;
        } else {
            m.shortOpenInterestUsd -= pos.sizeUsd;
        }

        int256 rawPnl = _calculatePnl(pos, currentOraclePrice);

        uint256 payoutUsdc;
        if (rawPnl >= 0) {
            uint256 requestedProfit = uint256(rawPnl);

            // JUNIOR PnL CAP: Profit cannot exceed domain's allowable realizable capacity
            uint256 availableDomainCap = domain.maxRealizablePnlCap;
            if (domain.currentRealizedPnl > 0) {
                availableDomainCap = availableDomainCap.saturating_sub(uint256(domain.currentRealizedPnl));
            }

            uint256 allowedProfit = requestedProfit;
            if (allowedProfit > availableDomainCap) {
                allowedProfit = availableDomainCap;
                emit JuniorPnlCapped(pos.market, pos.trader, requestedProfit, allowedProfit, 0);
            }

            domain.currentRealizedPnl += int256(allowedProfit);
            netPnlUsdc = int256(allowedProfit);

            payoutUsdc = pos.marginUsdc + allowedProfit;
            if (payoutUsdc > totalVaultLiquidityUsdc) {
                payoutUsdc = totalVaultLiquidityUsdc;
            }
            totalVaultLiquidityUsdc = totalVaultLiquidityUsdc.saturating_sub(allowedProfit);
        } else {
            // Loss stays in the vault and bolsters domain reserves
            uint256 loss = uint256(-rawPnl);
            domain.currentRealizedPnl -= int256(loss);
            netPnlUsdc = rawPnl;

            if (loss >= pos.marginUsdc) {
                payoutUsdc = 0;
                totalVaultLiquidityUsdc += pos.marginUsdc;
            } else {
                payoutUsdc = pos.marginUsdc - loss;
                totalVaultLiquidityUsdc += loss;
            }
        }

        if (payoutUsdc > 0) {
            require(usdc.transfer(pos.trader, payoutUsdc), "PAYOUT_TRANSFER_FAILED");
        }

        emit PositionClosed(positionId, pos.trader, netPnlUsdc, currentOraclePrice);
    }

    /**
     * @notice Liquidate undercollateralized position based on maintenance margin
     */
    function liquidatePosition(
        uint256 positionId,
        uint256 currentOraclePrice
    ) external nonReentrant verifySolvency {
        Position storage pos = positions[positionId];
        require(pos.isOpen, "POSITION_NOT_OPEN");

        int256 pnl = _calculatePnl(pos, currentOraclePrice);
        int256 remainingMargin = int256(pos.marginUsdc) + pnl;
        uint256 maintenanceThreshold = (pos.sizeUsd * MAINTENANCE_MARGIN_BPS) / BPS_DENOMINATOR;

        require(remainingMargin <= int256(maintenanceThreshold), "POSITION_HEALTHY");

        pos.isOpen = false;
        totalLockedMarginUsdc = totalLockedMarginUsdc.saturating_sub(pos.marginUsdc);

        MarketState storage m = markets[pos.market];
        if (pos.isLong) {
            m.longOpenInterestUsd -= pos.sizeUsd;
        } else {
            m.shortOpenInterestUsd -= pos.sizeUsd;
        }

        uint256 liquidatorReward = 2 * 1e6;
        if (remainingMargin > int256(liquidatorReward)) {
            liquidatorReward = uint256(remainingMargin) / 20;
        } else if (remainingMargin <= 0) {
            liquidatorReward = 0;
        }

        uint256 vaultKeeps = pos.marginUsdc.saturating_sub(liquidatorReward);
        totalVaultLiquidityUsdc += vaultKeeps;

        if (liquidatorReward > 0) {
            require(usdc.transfer(msg.sender, liquidatorReward), "REWARD_TRANSFER_FAILED");
        }

        emit PositionLiquidated(positionId, pos.trader, msg.sender, currentOraclePrice);
    }

    function getDynamicExecutionPrice(
        bytes32 market,
        bool isLong,
        uint256 orderSizeUsd,
        uint256 oraclePrice
    ) public view returns (uint256 executionPrice, uint256 spreadBps) {
        MarketState storage m = markets[market];
        spreadBps = m.baseSpreadBps;

        if (totalVaultLiquidityUsdc > 0) {
            int256 oiDelta = int256(m.longOpenInterestUsd) - int256(m.shortOpenInterestUsd);
            int256 skewBps = (oiDelta * int256(15)) / int256(totalVaultLiquidityUsdc);

            if (isLong) {
                if (skewBps > 0) spreadBps += uint256(skewBps);
            } else {
                if (skewBps < 0) spreadBps += uint256(-skewBps);
            }

            uint256 sizeImpactBps = (orderSizeUsd * 20) / totalVaultLiquidityUsdc;
            spreadBps += sizeImpactBps;
        }

        if (spreadBps > 100) spreadBps = 100;
        uint256 spreadAmount = (oraclePrice * spreadBps) / BPS_DENOMINATOR;
        executionPrice = isLong ? oraclePrice + spreadAmount : oraclePrice - spreadAmount;
    }

    /**
     * @notice Percolator-inspired Solvency Invariant Check
     * @dev Asserts that total available vault assets >= locked margin obligations
     */
    function checkSolvencyInvariant() public view returns (bool isSolvent, uint256 totalAssets, uint256 totalLiabilities) {
        totalAssets = totalVaultLiquidityUsdc;
        totalLiabilities = totalLockedMarginUsdc;
        isSolvent = totalAssets >= totalLiabilities;
    }

    function _calculatePnl(Position memory pos, uint256 currentPrice) internal pure returns (int256) {
        if (pos.isLong) {
            if (currentPrice >= pos.entryPrice) {
                uint256 diff = currentPrice - pos.entryPrice;
                return int256((diff * pos.sizeUsd) / pos.entryPrice);
            } else {
                uint256 diff = pos.entryPrice - currentPrice;
                return -int256((diff * pos.sizeUsd) / pos.entryPrice);
            }
        } else {
            if (currentPrice <= pos.entryPrice) {
                uint256 diff = pos.entryPrice - currentPrice;
                return int256((diff * pos.sizeUsd) / pos.entryPrice);
            } else {
                uint256 diff = currentPrice - pos.entryPrice;
                return -int256((diff * pos.sizeUsd) / pos.entryPrice);
            }
        }
    }

    function setSequencer(address _sequencer) external onlyOwner {
        sequencer = _sequencer;
    }
}

library Math {
    function saturating_sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : 0;
    }
}
using Math for uint256;

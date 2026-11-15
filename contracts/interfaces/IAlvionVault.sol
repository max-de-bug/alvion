// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAlvionVault
 * @notice Option A: Hybrid CLOB + Single USDC Vault on Avalanche C-Chain
 * @dev Enhanced with Percolator-inspired architecture:
 *      1. Junior PnL & Isolated Market Risk Domains
 *      2. Solvency Invariant Frame Checks
 *      3. Automated Vault Market Maker Integration
 */
interface IAlvionVault {
    struct Position {
        uint256 id;
        address trader;
        bytes32 market; // e.g. "AVAX", "BTC", "ETH"
        bool isLong;
        uint256 marginUsdc; // USDC collateral (6 decimals)
        uint256 leverage; // 1x to 100x
        uint256 sizeUsd; // marginUsdc * leverage
        uint256 entryPrice; // 18 decimals (Oracle Px +/- dynamic spread)
        uint256 openTimestamp; // block.timestamp when opened
        bool isOpen;
    }

    struct MarketState {
        uint256 longOpenInterestUsd;
        uint256 shortOpenInterestUsd;
        uint256 maxOpenInterestUsd;
        uint256 baseSpreadBps; // e.g. 5 bps = 0.05%
        uint256 maxLeverage; // up to 100x
        bool isActive;
    }

    // Percolator-inspired: Source-Domain Risk Isolation
    struct MarketDomain {
        uint256 isolatedInsuranceUsdc; // Dedicated domain risk reserve
        uint256 maxRealizablePnlCap;   // Upper bound on net trader profits from this market
        int256 currentRealizedPnl;     // Running net realized profit/loss
        uint256 epochStartTimestamp;
    }

    event PositionOpened(
        uint256 indexed positionId,
        address indexed trader,
        bytes32 indexed market,
        bool isLong,
        uint256 marginUsdc,
        uint256 leverage,
        uint256 entryPrice
    );

    event PositionClosed(
        uint256 indexed positionId,
        address indexed trader,
        int256 netPnlUsdc,
        uint256 exitPrice
    );

    event JuniorPnlCapped(
        bytes32 indexed market,
        address indexed trader,
        uint256 requestedProfit,
        uint256 allowedProfit,
        uint256 remainingDomainCap
    );

    event SolvencyInvariantChecked(
        uint256 totalAssetsUsdc,
        uint256 totalLockedMarginUsdc,
        bool isSolvent
    );

    event PositionLiquidated(
        uint256 indexed positionId,
        address indexed trader,
        address indexed liquidator,
        uint256 liquidationPrice
    );

    event LiquidityAdded(address indexed provider, uint256 usdcAmount, uint256 sharesMinted);
    event LiquidityRemoved(address indexed provider, uint256 sharesBurned, uint256 usdcReturned);

    function openPosition(
        bytes32 market,
        bool isLong,
        uint256 marginUsdc,
        uint256 leverage,
        uint256 oraclePrice,
        uint256 acceptablePrice
    ) external returns (uint256 positionId);

    function closePosition(
        uint256 positionId,
        uint256 currentOraclePrice
    ) external returns (int256 netPnlUsdc);

    function liquidatePosition(
        uint256 positionId,
        uint256 currentOraclePrice
    ) external;

    function getDynamicExecutionPrice(
        bytes32 market,
        bool isLong,
        uint256 orderSizeUsd,
        uint256 oraclePrice
    ) external view returns (uint256 executionPrice, uint256 spreadBps);

    function checkSolvencyInvariant() external view returns (bool isSolvent, uint256 totalAssets, uint256 totalLiabilities);
}

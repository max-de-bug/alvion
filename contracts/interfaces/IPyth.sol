// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint publishTime;
    }

    struct PriceFeed {
        bytes32 id;
        Price price;
        Price emaPrice;
    }

    function getPrice(bytes32 id) external view returns (Price memory price);
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (Price memory price);
    function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable;
    function getUpdateFee(bytes[] calldata priceUpdateData) external view returns (uint fee);
}


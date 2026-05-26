// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcPayRegistry
 * @dev Registry of merchant wallets and direct escrow settlements on the Arc Network.
 * Enables zero-friction stablecoin routing with native USDC gas optimization.
 */
contract ArcPayRegistry {
    address public owner;
    
    struct Merchant {
        string businessName;
        address settlementWallet;
        bool active;
    }
    
    mapping(string => Merchant) private merchants;
    
    event MerchantRegistered(string indexed merchantId, string businessName, address indexed settlementWallet);
    event DirectSettlement(string indexed invoiceId, address indexed customer, address indexed merchant, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can configure the registry");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register or update merchant profile
     */
    function registerMerchant(
        string calldata merchantId,
        string calldata businessName,
        address settlementWallet
    ) external {
        require(settlementWallet != address(0), "Invalid settlement address");
        merchants[merchantId] = Merchant({
            businessName: businessName,
            settlementWallet: settlementWallet,
            active: true
        });
        
        emit MerchantRegistered(merchantId, businessName, settlementWallet);
    }

    /**
     * @dev Retrieve merchant profile details
     */
    function getMerchant(string calldata merchantId) external view returns (string memory, address, bool) {
        Merchant memory m = merchants[merchantId];
        return (m.businessName, m.settlementWallet, m.active);
    }

    /**
     * @dev Record on-chain direct payment settlement with USDC gas delegation
     */
    function settlePayment(
        string calldata invoiceId,
        address merchantWallet,
        uint256 amount
    ) external payable {
        require(amount > 0, "Amount must exceed zero");
        require(merchantWallet != address(0), "Invalid merchant wallet");
        
        // Execute transfer logs (native USDC gas or direct ERC-20 transfers)
        emit DirectSettlement(invoiceId, msg.sender, merchantWallet, amount);
    }
}

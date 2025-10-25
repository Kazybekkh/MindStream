// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MindstreamThemeLogger
 * @dev Logs theme shifts from user sessions immutably on Base Sepolia
 * @notice This contract is designed for the Envio indexing track
 */
contract MindstreamThemeLogger {
    struct ThemeShift {
        uint256 timestamp;
        string sessionId;
        string theme;
        string prompt;
        address user;
    }

    // Mapping: sessionId => array of theme shifts
    mapping(string => ThemeShift[]) private sessionHistory;
    
    // Array of all session IDs for enumeration
    string[] private allSessions;
    
    // Mapping to check if session exists
    mapping(string => bool) private sessionExists;

    // Events for Envio indexer
    event ThemeShiftLogged(
        string indexed sessionId,
        uint256 indexed timestamp,
        string theme,
        string prompt,
        address indexed user
    );

    event SessionStarted(
        string indexed sessionId,
        uint256 timestamp,
        address indexed user
    );

    /**
     * @dev Log a new theme shift for a session
     * @param sessionId Unique identifier for the session
     * @param theme The detected theme (e.g., "nature", "technology")
     * @param prompt The generated visual prompt for Livepeer
     */
    function logThemeShift(
        string memory sessionId,
        string memory theme,
        string memory prompt
    ) external {
        // Create new session if it doesn't exist
        if (!sessionExists[sessionId]) {
            sessionExists[sessionId] = true;
            allSessions.push(sessionId);
            emit SessionStarted(sessionId, block.timestamp, msg.sender);
        }

        // Create and store theme shift
        ThemeShift memory shift = ThemeShift({
            timestamp: block.timestamp,
            sessionId: sessionId,
            theme: theme,
            prompt: prompt,
            user: msg.sender
        });

        sessionHistory[sessionId].push(shift);

        emit ThemeShiftLogged(
            sessionId,
            block.timestamp,
            theme,
            prompt,
            msg.sender
        );
    }

    /**
     * @dev Get all theme shifts for a specific session
     * @param sessionId The session to query
     * @return Array of theme shifts
     */
    function getSessionHistory(string memory sessionId) 
        external 
        view 
        returns (ThemeShift[] memory) 
    {
        return sessionHistory[sessionId];
    }

    /**
     * @dev Get the number of theme shifts in a session
     * @param sessionId The session to query
     * @return Number of shifts
     */
    function getSessionShiftCount(string memory sessionId) 
        external 
        view 
        returns (uint256) 
    {
        return sessionHistory[sessionId].length;
    }

    /**
     * @dev Get all session IDs
     * @return Array of all session IDs
     */
    function getAllSessions() external view returns (string[] memory) {
        return allSessions;
    }

    /**
     * @dev Get the total number of sessions
     * @return Number of sessions
     */
    function getTotalSessions() external view returns (uint256) {
        return allSessions.length;
    }
}

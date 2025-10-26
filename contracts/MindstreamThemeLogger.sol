// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MindstreamThemeLogger
 * @notice Stores the evolving AI prompt history for each performer and emits
 *         events that the Envio indexer can follow in real time.
 */
contract MindstreamThemeLogger {
    struct ThemeEntry {
        address participant;
        uint256 timestamp;
        string theme;
        string prompt;
        string[] keywords;
    }

    ThemeEntry[] private entries;

    event ThemeLogged(address indexed participant, uint256 indexed entryId, string theme, string prompt);

    /**
     * @notice Record a new theme into the immutable log.
     * @param theme         The dominant keyword detected by the analyzer.
     * @param prompt        The text prompt that Mindstream forwarded to Livepeer.
     * @param keywords      Additional supporting keywords in order of weight.
     * @return entryId      The numeric id of the stored entry.
     */
    function recordTheme(
        string calldata theme,
        string calldata prompt,
        string[] calldata keywords
    ) external returns (uint256 entryId) {
        ThemeEntry memory entry = ThemeEntry({
            participant: msg.sender,
            timestamp: block.timestamp,
            theme: theme,
            prompt: prompt,
            keywords: keywords
        });

        entries.push(entry);
        entryId = entries.length - 1;

        emit ThemeLogged(msg.sender, entryId, theme, prompt);
    }

    function totalEntries() external view returns (uint256) {
        return entries.length;
    }

    function getEntry(uint256 entryId) external view returns (ThemeEntry memory) {
        require(entryId < entries.length, "entry not found");
        return entries[entryId];
    }
}

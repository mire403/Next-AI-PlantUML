/**
 * Simple Regex-based parser to extract entities from PlantUML.
 * Used to populate the Visual Layout Editor.
 */

export interface DiagramNode {
    id: string;
    label: string;
    type: 'class' | 'actor' | 'participant' | 'usecase' | 'component' | 'interface' | 'unknown';
}

// Matches: type "Label" as Alias
// OR: type Alias
const ENTITY_REGEX = /^\s*(class|actor|participant|usecase|component|interface|object)\s+(?:\"([^\"]+)\"\s+as\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)(?:\s+as\s+\"([^\"]+)\")?|([a-zA-Z0-9_]+))/im;

export const parseEntities = (code: string): DiagramNode[] => {
    const lines = code.split('\n');
    const nodes: DiagramNode[] = [];
    const ids = new Set<string>();

    lines.forEach(line => {
        // Skip constraints and arrows
        if (line.includes('-[hidden]') || line.includes('->') || line.includes('--')) return;

        const match = line.match(ENTITY_REGEX);
        if (match) {
            const type = match[1] as DiagramNode['type'];
            let id = '';
            let label = '';

            // Case 1: participant "Label" as ID
            if (match[2] && match[3]) {
                label = match[2];
                id = match[3];
            } 
            // Case 2: participant ID (simple) or class ID
            else if (match[6]) {
                id = match[6];
                label = match[6];
            }
            // Case 3: participant ID as "Label" (rare but valid)
            else if (match[4]) {
                id = match[4];
                label = match[5] || match[4];
            }

            if (id && !ids.has(id)) {
                nodes.push({ id, label, type });
                ids.add(id);
            }
        }
    });

    // Second pass: Find implicit class definitions (e.g., ClassA -- ClassB) if not defined explicitly
    // Omitted for simplicity in this POC, focusing on explicit definitions which AI usually generates.

    return nodes;
};

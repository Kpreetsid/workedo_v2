export type SelectableTreeNode = {
	id?: string | null;
	childs?: SelectableTreeNode[] | null;
};

export const collectSelectedAssetIdsWithChildren = (
	assets: SelectableTreeNode[],
	selectedIds: string[]
): string[] => {
	if (!Array.isArray(assets) || assets.length === 0 || !Array.isArray(selectedIds) || selectedIds.length === 0) {
		return [];
	}

	const selectedSet = new Set(selectedIds.filter(Boolean));
	const ids = new Set<string>();

	const addSubtree = (nodes: SelectableTreeNode[]) => {
		nodes.forEach((node) => {
			if (node?.id) {
				ids.add(node.id);
			}

			if (Array.isArray(node?.childs) && node.childs.length > 0) {
				addSubtree(node.childs);
			}
		});
	};

	const traverse = (nodes: SelectableTreeNode[]) => {
		nodes.forEach((node) => {
			if (node?.id && selectedSet.has(node.id)) {
				addSubtree([node]);
				return;
			}

			if (Array.isArray(node?.childs) && node.childs.length > 0) {
				traverse(node.childs);
			}
		});
	};

	traverse(assets);
	return Array.from(ids);
};

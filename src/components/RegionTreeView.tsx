import React from 'react';
import { Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SimpleTreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view';
import { Region } from '../types/Region';
import RegionIcon from './RegionIcon';

interface RegionTreeViewProps {
  nodes: Region[];
  selectedId?: number | null;
  expandedIds?: string[];
  onSelect?: (id: number) => void;
  /** Optional per-node action buttons rendered after the region name */
  renderActions?: (node: Region) => React.ReactNode;
  sx?: object;
}

const RegionTreeView: React.FC<RegionTreeViewProps> = ({
  nodes,
  selectedId,
  expandedIds,
  onSelect,
  renderActions,
  sx,
}) => {
  function renderTree(items: Region[]): React.ReactNode {
    return items.map(node => (
      <TreeItem
        key={node.Id}
        itemId={String(node.Id)}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
            <RegionIcon regionSlug={node.Slug ?? ''} regionSymbol={node.Symbol} size={16} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>{node.Name}</Typography>
            {renderActions?.(node)}
          </Box>
        }
      >
        {node.Children && node.Children.length > 0 ? renderTree(node.Children) : null}
      </TreeItem>
    ));
  }

  return (
    <SimpleTreeView
      slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
      defaultExpandedItems={expandedIds ?? []}
      selectedItems={selectedId != null ? String(selectedId) : ''}
      onItemClick={onSelect ? (event, itemId) => {
        const target = event.target as HTMLElement;
        // Ignore clicks on the expand/collapse icon — those should only toggle the node open
        if (target.closest('.MuiTreeItem-iconContainer')) return;
        onSelect(parseInt(itemId, 10));
      } : undefined}
      sx={sx}
    >
      {renderTree(nodes)}
    </SimpleTreeView>
  );
};

export default RegionTreeView;

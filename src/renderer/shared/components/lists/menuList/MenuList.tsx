import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, Tooltip, useTheme } from '@mui/material';
import type { FC } from 'react';
import type { MenuItem } from '../../../types/menuItem';

interface Props {
  items: MenuItem[];
  showText: boolean;
  useTooltip: boolean;
}
export const MenuList: FC<Props> = ({ items, showText, useTooltip }) => {
  const theme = useTheme();
  return (
    <List sx={{ flexGrow: 1 }}>
      {items.map(item => {
        const listButton = (
          <ListItemButton
            selected={typeof item.isSelected === 'function' ? item.isSelected(item) : item.isSelected}
            onClick={() => {
              if (item.isToggle && item.onChange) {
                item.onChange(item);
              } else if (item.onClick) {
                item.onClick(item);
              }
            }}
            sx={{ ...(typeof item.minHeight !== 'undefined' && { minHeight: item.minHeight }) }}
          >
            <ListItemIcon sx={{ color: theme?.palette?.text?.primary || 'inherit' }}>{item.icon}</ListItemIcon>
            {showText && (
              <>
                <ListItemText
                  primary={item.text}
                  {...(typeof item.description !== 'undefined' && { secondary: item.description })}
                />
                {item.isToggle && <Switch edge="end" checked={item.checked} />}
              </>
            )}
          </ListItemButton>
        );

        return (
          <ListItem key={item.text} disablePadding>
            {useTooltip ? <Tooltip title={item.text}>{listButton}</Tooltip> : listButton}
          </ListItem>
        );
      })}
    </List>
  );
};

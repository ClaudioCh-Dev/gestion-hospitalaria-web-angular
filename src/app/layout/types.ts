export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
}

export interface SidebarGroup {
  item: SidebarItem;
  children?: SidebarItem[];
}
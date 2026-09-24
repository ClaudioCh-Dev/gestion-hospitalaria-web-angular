export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  // sin permiso = visible para todos; con una lista basta con tener cualquiera
  permission?: string | string[];
}

export interface SidebarGroup {
  item: SidebarItem;
  children?: SidebarItem[];
}
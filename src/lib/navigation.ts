import {
  LayoutDashboard,
  FolderKanban,
  Brain,
  Users,
  BarChart3,
  Building2,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const globalNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Tenders", href: "/tenders", icon: FolderKanban },
  { label: "Knowledge Hub", href: "/knowledge", icon: Brain },
  { label: "Suppliers", href: "/suppliers", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Organization", href: "/organization", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export type TenderTab = {
  label: string;
  segment: string;
};

export const tenderWorkspaceTabs: TenderTab[] = [
  { label: "Overview", segment: "" },
  { label: "Qualification", segment: "qualification" },
  { label: "Compliance", segment: "compliance" },
  { label: "Estimation", segment: "estimation" },
  { label: "Manpower", segment: "manpower" },
  { label: "Assets & PPM", segment: "assets" },
  { label: "Risk", segment: "risk" },
  { label: "SLA & KPI", segment: "sla" },
  { label: "Documents", segment: "documents" },
  { label: "Chat", segment: "chat" },
  { label: "Export", segment: "export" },
];

export const commandItems = [
  "Upload New Tender",
  "Open Dashboard",
  "View All Tenders",
  "Search Knowledge Base",
  "View Reports",
  "Organization Settings",
];

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const withIcon = (path: React.ReactNode) => {
  const IconComponent = ({ size = 20, className = "", ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {path}
    </svg>
  );
  IconComponent.displayName = "Icon";
  return IconComponent;
};

export const LayoutDashboard = withIcon(
  <>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </>
);

export const Building2 = withIcon(
  <>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </>
);

export const CalendarDays = withIcon(
  <>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </>
);

export const MessageSquare = withIcon(
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
);

export const Brush = withIcon(
  <>
    <path d="m11.66 16.44 9.9-9.9a1 1 0 0 0 0-1.41l-3.53-3.53a1 1 0 0 0-1.41 0l-9.9 9.9a2 2 0 0 0-.5 1l-.16 2.03a.5.5 0 0 0 .54.54l2.03-.16a2 2 0 0 0 1-.5Z" />
    <path d="m3.63 14.63-2.12 2.12a2 2 0 0 0 0 2.83l3.53 3.53a2 2 0 0 0 2.83 0l2.12-2.12z" />
  </>
);

export const Paintbrush = withIcon(
  <>
    <path d="m14.622 17.897-10.68-10.584" />
    <path d="m18.357 14.233-10.68-10.584" />
    <path d="m2 21 5-5" />
    <path d="M5 11c0-2.761 2.239-5 5-5h1.172a2 2 0 0 1 1.414.586l8.114 8.114a2 2 0 0 1 .586 1.414V17c0 2.761-2.239 5-5 5h-1.172a2 2 0 0 1-1.414-.586L5.586 13.414A2 2 0 0 1 5 12V11Z" />
  </>
);

export const Wrench = withIcon(
  <>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </>
);

export const Users = withIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const User = withIcon(
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

export const LogOut = withIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </>
);

export const Search = withIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </>
);

export const Bell = withIcon(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>
);

export const Settings = withIcon(
  <>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const CircleHelp = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </>
);

export const UserCircle = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </>
);

export const Ticket = withIcon(
  <>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </>
);

export const KeyRound = withIcon(
  <>
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
    <circle cx="16.5" cy="7.5" r=".5" />
  </>
);

export const DoorOpen = withIcon(
  <>
    <path d="M13 4h3a2 2 0 0 1 2 2v14" />
    <path d="M2 20h20" />
    <path d="M13 20V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16" />
    <path d="M10 12v.01" />
  </>
);

export const CircleCheck = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const Navigation = withIcon(
  <polygon points="3 11 22 2 13 21 11 13 3 11" />
);

export const MapPin = withIcon(
  <>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const CircleDot = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" />
  </>
);

export const WifiOff = withIcon(
  <>
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M8.5 8.5c1-.8 2.3-1.4 3.5-1.4 1.2 0 2.4.6 3.5 1.4" />
    <path d="M5 5a10 10 0 0 1 14 14" />
  </>
);

export const Pencil = withIcon(
  <>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </>
);

export const Trash2 = withIcon(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </>
);

export const RefreshCw = withIcon(
  <>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </>
);

export const ArrowRight = withIcon(
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>
);

export const Clock = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const AlertTriangle = withIcon(
  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
);

export const ChevronRight = withIcon(
  <path d="m9 18 6-6-6-6" />
);

export const ChevronLeft = withIcon(
  <path d="m15 18-6-6 6-6" />
);

export const Info = withIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>
);

export const Plus = withIcon(
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>
);

export const Activity = withIcon(
  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
);

export const Fingerprint = withIcon(
  <>
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M5 15a6 6 0 1 1 12-3" />
    <path d="M8 12a2 2 0 1 1 4 0v4" />
    <path d="M14 12V8a6 6 0 0 0-6 6" />
    <path d="M17 12c0-3.3-2.7-6-6-6" />
    <path d="M2 12v1" />
    <path d="M5 12v1" />
    <path d="M11 12v4" />
    <path d="M14 16v1" />
    <path d="M22 12v1" />
  </>
);

export const Mail = withIcon(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>
);

export const MoreVertical = withIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>
);

export const Filter = withIcon(
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
);

export const Bed = withIcon(
  <>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </>
);

export const Bath = withIcon(
  <>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-1.5 1.5 1.5 0 0 0-1 1.5V10" />
    <path d="M10 8.5 8 10.5" />
    <path d="M12 5h.01" />
    <path d="M13 2h.01" />
    <path d="M16 4h.01" />
    <path d="M17 1h.01" />
    <path d="M2 11h20v4a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8Z" />
    <path d="M7 11V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
  </>
);

export const Maximize = withIcon(
  <>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </>
);

export const Check = withIcon(
  <polyline points="20 6 9 17 4 12" />
);
export const LogIn = withIcon(
  <>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </>
);
export const X = withIcon(
  <>
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </>
);

export const BarChart2 = withIcon(
  <>
    <line x1="18" x2="18" y1="20" y2="10" />
    <line x1="12" x2="12" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="14" />
  </>
);

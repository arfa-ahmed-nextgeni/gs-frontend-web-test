"use client";

import { cn } from "@/lib/utils";

interface CustomerOrderStatusBadgeProps {
  showIcon?: boolean;
  size?: "lg" | "md" | "sm";
  status: OrderStatus;
}

interface OrderStatus {
  color: string;
  created_at: string;
  id: number;
  name: string;
  serial: number;
  updated_at: string;
}

export const CustomerOrderStatusBadge = ({
  showIcon = false,
  size = "md",
  status,
}: CustomerOrderStatusBadgeProps) => {
  const getStatusConfig = (statusName: string) => {
    const configs = {
      Cancelled: {
        bgColor: "#FF6B6B",
        icon: "❌",
        textColor: "#FFFFFF",
      },
      Delivered: {
        bgColor: "#02B290",
        icon: "✅",
        textColor: "#FFFFFF",
      },
      "On the way": {
        bgColor: "#FED030",
        icon: "🚚",
        textColor: "#000000",
      },
      "Order placed": {
        bgColor: "#A6B1BD",
        icon: "📦",
        textColor: "#FFFFFF",
      },
      Processing: {
        bgColor: "#4A90E2",
        icon: "⚙️",
        textColor: "#FFFFFF",
      },
      Shipped: {
        bgColor: "#9B59B6",
        icon: "📤",
        textColor: "#FFFFFF",
      },
    };

    return (
      configs[statusName as keyof typeof configs] || {
        bgColor: status.color || "#A6B1BD",
        icon: "📦",
        textColor: "#FFFFFF",
      }
    );
  };

  const config = getStatusConfig(status.name);

  const sizeClasses = {
    lg: "px-4 py-2 text-base lg:px-6 lg:py-3 lg:text-lg",
    md: "px-3 py-1.5 text-sm lg:px-4 lg:py-2 lg:text-base",
    sm: "px-2 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {showIcon && <span className="text-sm lg:text-base">{config.icon}</span>}
      <span>{status.name}</span>
    </div>
  );
};

// Status Progress Component for Order Tracking
interface CustomerOrderStatusProgressProps {
  allStatuses?: OrderStatus[];
  currentStatus: OrderStatus;
}

export const CustomerOrderStatusProgress = ({
  allStatuses = [],
  currentStatus,
}: CustomerOrderStatusProgressProps) => {
  const defaultStatuses = [
    { color: "#A6B1BD", id: 1, name: "Order placed", serial: 1 },
    { color: "#4A90E2", id: 2, name: "Processing", serial: 2 },
    { color: "#FED030", id: 3, name: "On the way", serial: 3 },
    { color: "#02B290", id: 4, name: "Delivered", serial: 4 },
  ];

  const statuses = allStatuses.length > 0 ? allStatuses : defaultStatuses;
  const currentSerial = currentStatus.serial || 1;

  return (
    <div className="relative flex items-center justify-between">
      {statuses.map((status, index) => {
        const isCompleted = status.serial <= currentSerial;
        const isCurrent = status.serial === currentSerial;

        return (
          <div className="flex flex-col items-center" key={status.id}>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium lg:h-10 lg:w-10 lg:text-sm",
                isCompleted
                  ? "border-bg-brand bg-bg-brand text-text-inverse"
                  : "border-border-base bg-bg-default text-text-secondary"
              )}
            >
              {isCompleted ? "✓" : status.serial}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium lg:text-sm",
                isCurrent
                  ? "text-text-primary"
                  : isCompleted
                    ? "text-text-secondary"
                    : "text-text-muted"
              )}
            >
              {status.name}
            </span>
            {index < statuses.length - 1 && (
              <div
                className={cn(
                  "absolute top-4 h-0.5 w-full lg:top-5",
                  isCompleted ? "bg-bg-brand" : "bg-border-base"
                )}
                style={{
                  left: "50%",
                  transform: "translateX(50%)",
                  width: "100%",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';

export default function Skeleton({
  width,
  height,
  radius,
  className,
  style,
  ...rest
}) {
  const classes = className ? `db-skeleton ${className}` : 'db-skeleton';
  const resolvedStyle = {
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(radius !== undefined && { borderRadius: typeof radius === 'number' ? `${radius}px` : radius }),
    ...style,
  };
  return <div aria-hidden="true" className={classes} style={resolvedStyle} {...rest} />;
}

export function StatCardSkeleton() {
  return (
    <div className="db-stat-card" aria-busy="true">
      <Skeleton width={80} height={12} style={{ marginBottom: 12 }} />
      <Skeleton width={100} height={28} style={{ marginBottom: 6 }} />
      <Skeleton width={60} height={10} />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  const widths = ['22%', '16%', '14%', '12%', '14%', '10%'];
  return (
    <tr aria-busy="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <Skeleton height={14} width={widths[i % widths.length]} />
        </td>
      ))}
    </tr>
  );
}

export function CardBodySkeleton({ lines = 3 }) {
  return (
    <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '40%' : '100%'}
        />
      ))}
    </div>
  );
}

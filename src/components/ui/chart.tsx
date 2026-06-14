'use client';

import type { ContentType as LegendContentType } from 'recharts/types/component/DefaultLegendContent';
import type {
  NameType,
  Props as TooltipContentProps,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import type { ContentType as TooltipContentType } from 'recharts/types/component/Tooltip';

import {
  createContext,
  type ReactElement,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import {
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
} from 'react-aria-components/ToggleButtonGroup';
import {
  CartesianGrid as CartesianGridPrimitive,
  type CartesianGridProps as CartesianGridPrimitiveProps,
  type CartesianGridProps,
  type LegendPayload,
  Legend as LegendPrimitive,
  type LegendProps,
  ResponsiveContainer,
  Tooltip as TooltipPrimitive,
  type TooltipProps,
  XAxis as XAxisPrimitive,
  type XAxisProps as XAxisPropsPrimitive,
  YAxis as YAxisPrimitive,
  type YAxisProps as YAxisPrimitiveProps,
} from 'recharts';
import { twJoin, twMerge } from 'tailwind-merge';

import { useIsMobile } from '#/hooks/use-mobile';
import { cx } from '#/lib/primitive';

// #region Chart Types
type ChartType = 'default' | 'stacked' | 'percent';
type ChartLayout = 'horizontal' | 'vertical' | 'radial';
type IntervalType = 'preserveStartEnd' | 'equidistantPreserveStart';

type ChartConfig = Record<
  string,
  { icon?: React.ComponentType; label?: React.ReactNode } & (
    | { color?: ChartColorKeys | (string & {}); theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

const CHART_COLORS = {
  'chart-1': 'var(--chart-1)',
  'chart-2': 'var(--chart-2)',
  'chart-3': 'var(--chart-3)',
  'chart-4': 'var(--chart-4)',
  'chart-5': 'var(--chart-5)',
} as const;

type ChartColorKeys = keyof typeof CHART_COLORS | (string & {});

const DEFAULT_COLORS = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const;

type ChartContextProps = {
  config: ChartConfig;
  data?: Record<string, any>[];
  dataKey?: string;
  layout: ChartLayout;
  onLegendSelect: (legendItem: string | null) => void;
  selectedLegend: string | null;
};

const ChartContext = createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = use(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <Chart />');
  }

  return context;
}

export function valueToPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

const constructCategoryColors = (
  categories: string[],
  colors: readonly ChartColorKeys[],
): Map<string, ChartColorKeys> => {
  const categoryColors = new Map<string, ChartColorKeys>();

  for (const [index, category] of categories.entries()) {
    const color = colors[index % colors.length];
    if (color !== undefined) {
      categoryColors.set(category, color);
    }
  }

  return categoryColors;
};

const getColorValue = (color?: string): string => {
  if (!color) {
    return 'var(--chart-1)';
  }

  return CHART_COLORS[color as 'chart-1'] ?? color;
};

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

type BaseChartProps = {
  cartesianGridProps?: CartesianGridProps;
  colors?: readonly (ChartColorKeys | (string & {}))[];
  config: ChartConfig;
  containerHeight?: number;
  data: Record<string, any>[];
  dataKey: string;
  displayEdgeLabelsOnly?: boolean;
  hideGridLines?: boolean;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  intervalType?: IntervalType;
  layout?: ChartLayout;
  legend?: LegendContentType | boolean;
  legendProps?: Omit<
    React.ComponentProps<typeof LegendPrimitive>,
    'content' | 'ref'
  >;
  tooltip?: TooltipContentType | boolean;
  tooltipProps?: Omit<TooltipProps, 'content'> & {
    hideIndicator?: boolean;
    hideLabel?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    labelKey?: string;
    labelSeparator?: boolean;
    nameKey?: string;
  };
  type?: ChartType;
  valueFormatter?: (value: number) => string;
  xAxisProps?: XAxisPropsPrimitive;
  yAxisProps?: YAxisPrimitiveProps;
} & React.HTMLAttributes<HTMLDivElement>;

const Chart = ({
  children,
  className,
  config,
  containerHeight,
  data,
  dataKey,
  id,
  layout = 'horizontal',
  ref,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> &
  Pick<ChartContextProps, 'data' | 'dataKey'> & {
    children: ReactElement | ((props: ChartContextProps) => ReactElement);
    config: ChartConfig;
    containerHeight?: number;
    layout?: ChartLayout;
  }) => {
  const isMobile = useIsMobile();
  const uniqueId = useId();
  const chartId = useMemo(
    () => `chart-${id ?? uniqueId.replaceAll(':', '')}`,
    [id, uniqueId],
  );

  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);

  const onLegendSelect = useCallback((legendItem: string | null) => {
    setSelectedLegend(legendItem);
  }, []);

  const value = useMemo(
    () => ({
      config,
      data: data ?? [],
      dataKey: dataKey ?? 'value',
      layout,
      onLegendSelect,
      selectedLegend,
    }),
    [config, selectedLegend, onLegendSelect, data, dataKey, layout],
  );

  return (
    <ChartContext value={value}>
      <div
        ref={ref}
        className={twMerge(
          'z-20 flex w-full justify-center text-xs',
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-fg [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/80 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden [&_.recharts-surface_.recharts-text.recharts-cartesian-axis-tick-value]:*:fill-muted-fg",
          "[&_.recharts-dot[fill='#fff']]:fill-(--line-color)",
          '[&_.recharts-active-dot>.recharts-dot]:stroke-fg/10',

          '[&_.recharts-surface_g]:focus:outline-hidden',

          className,
        )}
        data-chart={chartId}
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <ResponsiveContainer height={containerHeight ?? (isMobile ? 200 : 370)}>
          {typeof children === 'function' ? children(value) : children}
        </ResponsiveContainer>
      </div>
    </ChartContext>
  );
};

const THEMES = { dark: '.dark', light: '' } as const;
const ChartStyle = ({ config, id }: { config: ChartConfig; id: string }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme ?? itemConfig.color,
  );

  if (colorConfig.length === 0) {
    return null;
  }

  const css = Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
    )
    .join('\n');

  return <style>{css}</style>;
};

type ChartTooltipProps<
  TValue extends ValueType,
  TName extends NameType,
> = TooltipProps<TValue, TName>;

const tooltipWrapperStyle = { outline: 'none' } as const;

const cursorStyleRadial = {
  fill: 'var(--muted)',
  fillOpacity: 0.5,
  stroke: 'var(--muted)',
  strokeWidth: 0.1,
} as const;

const cursorStyleDefault = {
  fill: 'var(--muted)',
  fillOpacity: 0.5,
  stroke: 'var(--muted)',
  strokeWidth: 1,
} as const;

const ChartTooltip = (props: TooltipProps) => {
  const { layout } = useChart();
  const cursorStyle =
    layout === 'radial' ? cursorStyleRadial : cursorStyleDefault;

  return (
    <TooltipPrimitive
      cursor={cursorStyle}
      wrapperStyle={tooltipWrapperStyle}
      {...props}
    />
  );
};

type ChartLegendProps = Omit<
  React.ComponentProps<typeof LegendPrimitive>,
  'ref'
>;

const ChartLegend = (props: ChartLegendProps) => {
  return <LegendPrimitive align="center" verticalAlign="bottom" {...props} />;
};

type XAxisProps = {
  displayEdgeLabelsOnly?: boolean;
  intervalType?: IntervalType;
} & Omit<XAxisPropsPrimitive, 'ref'>;

const tickHorizontal = { transform: 'translate(32, 6)' } as const;

const XAxis = ({
  className,
  displayEdgeLabelsOnly,
  intervalType = 'preserveStartEnd',
  minTickGap = 5,
  ...props
}: XAxisProps) => {
  const { data, dataKey, layout } = useChart();

  const ticks =
    displayEdgeLabelsOnly && data?.length && dataKey
      ? [data[0]?.[dataKey], data.at(-1)?.[dataKey]]
      : undefined;

  const tick = layout === 'horizontal' ? tickHorizontal : undefined;
  return (
    <XAxisPrimitive
      axisLine={false}
      className={twMerge(
        'text-muted-fg text-xs **:[text]:fill-muted-fg',
        className,
      )}
      dataKey={layout === 'horizontal' ? dataKey : undefined}
      interval={displayEdgeLabelsOnly ? 'preserveStartEnd' : intervalType}
      minTickGap={minTickGap}
      tick={tick}
      tickLine={false}
      ticks={ticks}
      {...props}
    />
  );
};

const yAxisTickHorizontal = { transform: 'translate(-3, 0)' } as const;

const yAxisTickVertical = { transform: 'translate(0, 0)' } as const;

const YAxis = ({
  className,
  domain = ['auto', 'auto'],
  type,
  width,
  ...props
}: Omit<YAxisPrimitiveProps, 'ref'>) => {
  const { dataKey, layout } = useChart();

  const tick =
    layout === 'horizontal' ? yAxisTickHorizontal : yAxisTickVertical;

  return (
    <YAxisPrimitive
      axisLine={false}
      className={twMerge(
        'text-muted-fg text-xs **:[text]:fill-muted-fg',
        className,
      )}
      dataKey={layout === 'horizontal' ? undefined : dataKey}
      domain={domain}
      interval={
        layout === 'horizontal' ? undefined : 'equidistantPreserveStart'
      }
      tick={tick}
      tickLine={false}
      type={type ?? (layout === 'horizontal' ? 'number' : 'category')}
      width={width ?? (layout === 'horizontal' ? 40 : 80)}
      {...props}
    />
  );
};

const CartesianGrid = ({
  className,
  ...props
}: CartesianGridPrimitiveProps) => {
  const { layout } = useChart();
  return (
    <CartesianGridPrimitive
      className={twMerge('stroke-1 stroke-muted', className)}
      horizontal={layout !== 'vertical'}
      vertical={layout === 'vertical'}
      {...props}
    />
  );
};

const ChartTooltipContent = <TValue extends ValueType, TName extends NameType>({
  className,
  color,
  formatter,
  hideIndicator = false,
  hideLabel = false,
  indicator = 'dot',
  label,
  labelClassName,
  labelFormatter,
  labelKey,
  labelSeparator = true,
  nameKey,
  payload,
  ref,
}: TooltipContentProps<TValue, TName> &
  React.ComponentProps<'div'> & {
    hideIndicator?: boolean;
    hideLabel?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    labelKey?: string;
    labelSeparator?: boolean;
    nameKey?: string;
  }) => {
  const { config } = useChart();

  const tooltipLabel = useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;

    if (!item) {
      return null;
    }

    const key = `${labelKey ?? item.dataKey ?? item.name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={labelClassName}>{labelFormatter(value, payload)}</div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={labelClassName}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      ref={ref}
      className={twMerge(
        'grid min-w-48 items-start rounded-lg bg-overlay/70 p-3 py-2 text-overlay-fg text-xs ring ring-current/10 backdrop-blur-lg',
        className,
      )}
    >
      {!hideLabel && (
        <>
          {!nestLabel ? (
            <span className="font-medium">{tooltipLabel}</span>
          ) : null}
          {labelSeparator && (
            <span
              aria-hidden
              className="mt-2 mb-3 block h-px w-full bg-bg/10"
            />
          )}
        </>
      )}
      <div className="grid gap-3">
        {payload.map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload.fill ?? item.color;

          return (
            <div
              key={key}
              className={twMerge(
                'flex w-full flex-wrap items-stretch gap-2 *:[svg]:text-muted-fg',
                indicator === 'dot' && 'items-center *:[svg]:size-2.5',
                indicator === 'line' && '*:[svg]:h-full *:[svg]:w-2.5',
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={twMerge(
                          'shrink-0 rounded-full border-(--color-border) bg-(--color-bg)',
                          indicator === 'dot' && 'size-2.5',
                          indicator === 'line' && 'w-1',
                          indicator === 'dashed' &&
                            'w-0 border-[1.5px] border-dashed bg-transparent',
                          nestLabel && indicator === 'dashed' && 'my-0.5',
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={twMerge(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center',
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-fg">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>

                    {item.value !== undefined && item.value !== null && (
                      <span className="font-mono font-medium text-fg tabular-nums">
                        {item.value.toString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ChartLegendContentProps = ToggleButtonGroupProps &
  Pick<LegendProps, 'align' | 'verticalAlign'> & {
    hideIcon?: boolean;
    nameKey?: string;
    payload?: readonly LegendPayload[];
    ref?: React.Ref<any>;
  };

const ChartLegendContent = ({
  align = 'right',
  className,
  hideIcon = false,
  nameKey,
  payload,
  ref,
  verticalAlign = 'bottom',
}: ChartLegendContentProps) => {
  const { config, onLegendSelect, selectedLegend } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <ToggleButtonGroup
      ref={ref}
      className={cx(
        twJoin(
          'flex flex-wrap items-center gap-x-1',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          align === 'right'
            ? 'justify-end'
            : align === 'left'
              ? 'justify-start'
              : 'justify-center',
        ),
        className,
      )}
      selectedKeys={selectedLegend ? [selectedLegend] : undefined}
      selectionMode="single"
      onSelectionChange={(v) => {
        const key = [...v][0]?.toString() ?? null;
        onLegendSelect(key);
      }}
    >
      {payload.map((item: LegendPayload) => {
        const key = `${nameKey ?? item.dataKey ?? 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <ToggleButton
            key={key}
            aria-label="Legend Item"
            className={twMerge(
              'flex items-center gap-2 rounded-sm px-2 py-1 text-muted-fg *:[svg]:-mx-0.5 *:[svg]:size-2.5 *:[svg]:shrink-0 *:[svg]:text-muted-fg',
              'selected:bg-secondary/70 selected:text-secondary-fg',
              'hover:bg-secondary/70 hover:text-secondary-fg',
            )}
            id={key}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export type {
  BaseChartProps,
  ChartColorKeys,
  ChartConfig,
  ChartLayout,
  ChartLegendContentProps,
  ChartLegendProps,
  ChartTooltipProps,
  ChartType,
  IntervalType,
  XAxisProps,
};
export {
  CartesianGrid,
  Chart,
  CHART_COLORS,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  constructCategoryColors,
  DEFAULT_COLORS,
  getColorValue,
  XAxis,
  YAxis,
};

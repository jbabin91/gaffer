'use client';

import { useMemo } from 'react';
import {
  Line,
  LineChart as LineChartPrimitive,
  type LineProps,
} from 'recharts';

import {
  type BaseChartProps,
  CartesianGrid,
  Chart,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  constructCategoryColors,
  DEFAULT_COLORS,
  getColorValue,
  valueToPercent,
  XAxis,
  YAxis,
} from './chart';

export type LineChartProps = {
  chartProps?: Omit<
    React.ComponentProps<typeof LineChartPrimitive>,
    'data' | 'stackOffset'
  >;
  connectNulls?: boolean;
  lineProps?: LineProps;
} & BaseChartProps;

export function LineChart({
  chartProps,
  children,
  colors = DEFAULT_COLORS,
  config,
  connectNulls = false,
  data,
  dataKey,

  displayEdgeLabelsOnly = false,
  hideGridLines = false,

  hideXAxis = false,
  hideYAxis = false,

  intervalType = 'equidistantPreserveStart',

  legend = true,

  legendProps,
  lineProps,
  tooltip = true,

  tooltipProps,
  type = 'default',

  valueFormatter = (value: number) => value.toString(),
  xAxisProps,
  yAxisProps,
  ...props
}: LineChartProps) {
  const configKeys = useMemo(() => Object.keys(config), [config]);
  const categoryColors = useMemo(
    () => constructCategoryColors(configKeys, colors),
    [configKeys, colors],
  );

  const configEntries = useMemo(() => Object.entries(config), [config]);

  return (
    <Chart config={config} data={data} dataKey={dataKey} {...props}>
      {({ onLegendSelect, selectedLegend }) => (
        <LineChartPrimitive
          data={data}
          margin={{ bottom: 0, left: 0, right: 0, top: 5 }}
          stackOffset={type === 'percent' ? 'expand' : undefined}
          onClick={() => {
            onLegendSelect(null);
          }}
          {...chartProps}
        >
          {!hideGridLines && <CartesianGrid strokeDasharray="4 4" />}
          <XAxis
            displayEdgeLabelsOnly={displayEdgeLabelsOnly}
            hide={hideXAxis}
            intervalType={intervalType}
            {...xAxisProps}
          />
          <YAxis
            hide={hideYAxis}
            tickFormatter={type === 'percent' ? valueToPercent : valueFormatter}
            {...yAxisProps}
          />

          {legend && (
            <ChartLegend
              content={
                typeof legend === 'boolean' ? <ChartLegendContent /> : legend
              }
              {...legendProps}
            />
          )}

          {tooltip && (
            <ChartTooltip
              content={
                typeof tooltip === 'boolean' ? (
                  <ChartTooltipContent accessibilityLayer />
                ) : (
                  tooltip
                )
              }
              {...tooltipProps}
            />
          )}

          {children ??
            configEntries.map(([category, values]) => {
              const strokeOpacity =
                selectedLegend && selectedLegend !== category ? 0.1 : 1;
              const color = getColorValue(
                values.color ?? categoryColors.get(category),
              );

              return (
                <Line
                  key={category}
                  connectNulls={connectNulls}
                  dataKey={category}
                  dot={false}
                  name={category}
                  stroke={color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={
                    {
                      '--line-color': color,
                      strokeOpacity,
                      strokeWidth: 2,
                    } as React.CSSProperties
                  }
                  type="linear"
                  {...lineProps}
                />
              );
            })}
        </LineChartPrimitive>
      )}
    </Chart>
  );
}

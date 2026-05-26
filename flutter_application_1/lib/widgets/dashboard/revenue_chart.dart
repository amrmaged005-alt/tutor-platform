import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../core/theme.dart';

class RevenueChart extends StatelessWidget {
  const RevenueChart({super.key, required this.values});
  final List<double> values;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final max = values.fold<double>(1, (a, b) => a > b ? a : b);
    return Container(
      height: 170,
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 10),
      decoration: BoxDecoration(
        color: c.card,
        border: Border.all(color: c.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: BarChart(
        BarChartData(
          maxY: max * 1.2,
          borderData: FlBorderData(show: false),
          gridData: const FlGridData(show: false),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(),
            topTitles: const AxisTitles(),
            rightTitles: const AxisTitles(),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, _) {
                  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                  final index = value.toInt();
                  if (index < 0 || index >= days.length) {
                    return const SizedBox();
                  }
                  return Text(
                    days[index],
                    style: TextStyle(
                      color: c.muted,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  );
                },
              ),
            ),
          ),
          barGroups: [
            for (var i = 0; i < values.length; i++)
              BarChartGroupData(
                x: i,
                barRods: [
                  BarChartRodData(
                    toY: values[i],
                    width: 14,
                    borderRadius: BorderRadius.circular(5),
                    color: c.accent,
                    backDrawRodData: BackgroundBarChartRodData(
                      show: true,
                      toY: max * 1.2,
                      color: c.border.withValues(alpha: 0.45),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

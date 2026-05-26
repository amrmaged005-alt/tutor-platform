import 'package:flutter/material.dart';

import '../core/theme.dart';

class SkeletonClassGrid extends StatelessWidget {
  const SkeletonClassGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.64,
      ),
      itemCount: 6,
      itemBuilder: (_, _) => const SkeletonClassCard(),
    );
  }
}

class SkeletonClassCard extends StatelessWidget {
  const SkeletonClassCard({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: c.card,
        border: Border.all(color: c.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _block(context, width: 54, height: 22, radius: 8),
              const Spacer(),
              _block(context, width: 40, height: 18, radius: 6),
            ],
          ),
          const SizedBox(height: 9),
          _block(context, height: 48, radius: 12),
          const SizedBox(height: 9),
          _block(context, height: 6, radius: 99),
          const SizedBox(height: 10),
          _block(context, height: 14, radius: 5),
          const SizedBox(height: 6),
          _block(context, width: 88, height: 14, radius: 5),
          const Spacer(),
          _block(context, width: 96, height: 18, radius: 8),
        ],
      ),
    );
  }

  Widget _block(
    BuildContext context, {
    double? width,
    required double height,
    required double radius,
  }) {
    final c = context.c;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: c.border.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import 'marketplace_widgets.dart';

class ReviewsSection extends StatefulWidget {
  const ReviewsSection({
    super.key,
    required this.title,
    required this.load,
    this.classId,
  });

  final String title;
  final Future<List<ReviewItem>> Function() load;
  final String? classId;

  @override
  State<ReviewsSection> createState() => _ReviewsSectionState();
}

class _ReviewsSectionState extends State<ReviewsSection> {
  late Future<List<ReviewItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.load();
  }

  void _refresh() => setState(() => _future = widget.load());

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return FutureBuilder<List<ReviewItem>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: LinearProgressIndicator(minHeight: 2),
          );
        }
        final reviews = snapshot.data ?? [];
        final avg = reviews.isEmpty
            ? 0.0
            : reviews.fold<double>(0, (sum, item) => sum + item.rating) /
                  reviews.length;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: widget.title,
              action: widget.classId == null ? null : l.t('reviews.leave'),
              onAction: widget.classId == null
                  ? null
                  : () async {
                      await showLeaveReviewSheet(context, widget.classId!);
                      _refresh();
                    },
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  StarRating(value: avg, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    reviews.isEmpty
                        ? l.t('reviews.empty')
                        : '${avg.toStringAsFixed(1)} (${reviews.length})',
                    style: TextStyle(
                      color: c.secondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            if (reviews.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  l.t('reviews.emptyBody'),
                  style: TextStyle(color: c.secondary, fontSize: 13),
                ),
              )
            else
              ...reviews
                  .take(5)
                  .map(
                    (review) => Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                      child: ReviewCard(review: review),
                    ),
                  ),
          ],
        );
      },
    );
  }
}

class ReviewCard extends StatelessWidget {
  const ReviewCard({super.key, required this.review});
  final ReviewItem review;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      padding: const EdgeInsets.all(12),
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
              Expanded(
                child: Text(
                  review.reviewerName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: c.text,
                    fontWeight: FontWeight.w900,
                    fontSize: 13,
                  ),
                ),
              ),
              StarRating(value: review.rating.toDouble(), size: 14),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            _dateLabel(review.createdAt),
            style: TextStyle(
              color: c.muted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          if ((review.comment ?? '').isNotEmpty) ...[
            const SizedBox(height: 7),
            Text(
              review.comment!,
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: c.secondary, height: 1.45),
            ),
          ],
        ],
      ),
    );
  }

  String _dateLabel(DateTime date) => '${date.day}/${date.month}/${date.year}';
}

class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.value, this.size = 20});
  final double value;
  final double size;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: List.generate(5, (index) {
      final filled = value >= index + 0.75;
      return Icon(
        filled ? Icons.star_rounded : Icons.star_border_rounded,
        color: AppColors.rating,
        size: size,
      );
    }),
  );
}

Future<void> showLeaveReviewSheet(BuildContext context, String classId) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => LeaveReviewSheet(classId: classId),
  );
}

class LeaveReviewSheet extends StatefulWidget {
  const LeaveReviewSheet({super.key, required this.classId});
  final String classId;

  @override
  State<LeaveReviewSheet> createState() => _LeaveReviewSheetState();
}

class _LeaveReviewSheetState extends State<LeaveReviewSheet> {
  final _comment = TextEditingController();
  int _rating = 5;
  bool _loading = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          18,
          4,
          18,
          MediaQuery.viewInsetsOf(context).bottom + 18,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l.t('reviews.leave'),
              style: TextStyle(
                color: c.text,
                fontSize: 21,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: List.generate(
                5,
                (index) => IconButton(
                  onPressed: () => setState(() => _rating = index + 1),
                  icon: Icon(
                    index < _rating
                        ? Icons.star_rounded
                        : Icons.star_border_rounded,
                    color: AppColors.rating,
                    size: 30,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _comment,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(hintText: l.t('reviews.comment')),
            ),
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(l.t('reviews.submit')),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      await context.app.marketplace.leaveClassReview(
        classId: widget.classId,
        rating: _rating,
        comment: _comment.text,
      );
      if (mounted) Navigator.pop(context);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error.toString()),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}

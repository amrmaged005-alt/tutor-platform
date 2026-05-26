import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';

Future<void> showBookingSheet(BuildContext context, AppClass item) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => BookingSheet(item: item),
  );
}

class BookingSheet extends StatefulWidget {
  const BookingSheet({super.key, required this.item});
  final AppClass item;

  @override
  State<BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends State<BookingSheet> {
  final _note = TextEditingController();
  int _sessionCount = 1;
  String _paymentType = 'IN_PERSON';
  bool _loading = false;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final total = widget.item.priceEgp * _sessionCount;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.74,
      minChildSize: 0.48,
      maxChildSize: 0.92,
      builder: (context, controller) => SafeArea(
        top: false,
        child: ListView(
          controller: controller,
          padding: EdgeInsets.fromLTRB(
            18,
            4,
            18,
            MediaQuery.viewInsetsOf(context).bottom + 18,
          ),
          children: [
            Text(
              l.t('booking.title'),
              style: TextStyle(
                color: c.text,
                fontSize: 22,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              widget.item.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: c.secondary, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 18),
            _StepperRow(
              value: _sessionCount,
              onMinus: _sessionCount == 1
                  ? null
                  : () => setState(() => _sessionCount--),
              onPlus: _sessionCount == 5
                  ? null
                  : () => setState(() => _sessionCount++),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _note,
              minLines: 2,
              maxLines: 4,
              decoration: InputDecoration(hintText: l.t('booking.note')),
            ),
            const SizedBox(height: 16),
            _PaymentTile(
              title: l.t('booking.payNow'),
              subtitle: l.t('booking.payNowBody'),
              icon: Icons.credit_card_rounded,
              selected: _paymentType == 'ONLINE',
              onTap: () => setState(() => _paymentType = 'ONLINE'),
            ),
            const SizedBox(height: 8),
            _PaymentTile(
              title: l.t('booking.payCenter'),
              subtitle: l.t('booking.payCenterBody'),
              icon: Icons.storefront_outlined,
              selected: _paymentType == 'IN_PERSON',
              onTap: () => setState(() => _paymentType = 'IN_PERSON'),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: Text(
                    total == 0
                        ? l.t('common.free')
                        : '$total ${l.t('common.egp')}',
                    style: TextStyle(
                      color: c.accent,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(l.t('booking.confirm')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      final result = await context.app.marketplace.bookClass(
        classId: widget.item.id,
        sessionCount: _sessionCount,
        paymentType: _paymentType,
        note: _note.text,
      );
      if (!mounted) return;
      if (result.paymentUrl != null) {
        await launchUrl(
          Uri.parse(result.paymentUrl!),
          mode: LaunchMode.externalApplication,
        );
      }
      if (!mounted) return;
      Navigator.pop(context);
      context.push(
        '/booking-confirmed',
        extra: (booking: result, item: widget.item),
      );
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

class BookingConfirmationScreen extends StatelessWidget {
  const BookingConfirmationScreen({
    super.key,
    required this.result,
    required this.item,
  });
  final BookingResult result;
  final AppClass item;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('booking.success'))),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: c.accent.withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_rounded, color: c.accent, size: 36),
              ),
              const SizedBox(height: 18),
              Text(
                l.t('booking.success'),
                style: TextStyle(
                  color: c.text,
                  fontSize: 27,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 8),
              Text(result.message, style: TextStyle(color: c.secondary)),
              const SizedBox(height: 18),
              _SummaryRow(label: l.t('booking.id'), value: result.bookingId),
              _SummaryRow(label: l.t('classes.title'), value: item.title),
              _SummaryRow(label: l.t('tutors.title'), value: item.providerName),
              const Spacer(),
              ElevatedButton(
                onPressed: () => context.go('/dashboard'),
                child: Text(l.t('booking.viewBookings')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepperRow extends StatelessWidget {
  const _StepperRow({required this.value, this.onMinus, this.onPlus});
  final int value;
  final VoidCallback? onMinus;
  final VoidCallback? onPlus;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Row(
      children: [
        Expanded(
          child: Text(
            l.t('booking.sessions'),
            style: TextStyle(
              color: context.c.text,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        IconButton.filledTonal(
          onPressed: onMinus,
          icon: const Icon(Icons.remove),
        ),
        SizedBox(
          width: 40,
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: context.c.text,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        IconButton.filled(onPressed: onPlus, icon: const Icon(Icons.add)),
      ],
    );
  }
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Ink(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? c.accent.withValues(alpha: 0.1) : c.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? c.accent : c.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: selected ? c.accent : c.muted),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: c.text,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    style: TextStyle(color: c.secondary, fontSize: 12),
                  ),
                ],
              ),
            ),
            Icon(
              selected
                  ? Icons.radio_button_checked_rounded
                  : Icons.radio_button_off_rounded,
              color: selected ? c.accent : c.muted,
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: context.c.muted,
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: TextStyle(
            color: context.c.text,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    ),
  );
}

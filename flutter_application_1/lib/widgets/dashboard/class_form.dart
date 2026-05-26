import 'package:flutter/material.dart';

import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../core/theme.dart';
import '../marketplace_widgets.dart';

class ManagedClassForm extends StatefulWidget {
  const ManagedClassForm({super.key, this.initial, this.isCenter = false});
  final AppClass? initial;
  final bool isCenter;

  @override
  State<ManagedClassForm> createState() => _ManagedClassFormState();
}

class _ManagedClassFormState extends State<ManagedClassForm> {
  final _form = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _description;
  late final TextEditingController _price;
  late final TextEditingController _seats;
  late final TextEditingController _schedule;
  late final TextEditingController _duration;
  late final TextEditingController _location;
  String _subject = subjects.first;
  String _format = formats.first;
  String _level = 'Intermediate';
  String _assignedTutor = 'Amina Hassan';

  @override
  void initState() {
    super.initState();
    final item = widget.initial;
    _title = TextEditingController(text: item?.title ?? '');
    _description = TextEditingController(text: item?.description ?? '');
    _price = TextEditingController(text: '${item?.priceEgp ?? 250}');
    _seats = TextEditingController(text: '${item?.seatLimit ?? 16}');
    _schedule = TextEditingController(text: item?.schedule ?? 'Sun 6:00 PM');
    _duration = TextEditingController(text: '${item?.durationMinutes ?? 90}');
    _location = TextEditingController(text: item?.location ?? 'Nasr City');
    _subject = item?.subject ?? subjects.first;
    _format = item?.format ?? formats.first;
    _level = item?.level ?? 'Intermediate';
    _assignedTutor = item?.providerName ?? 'Amina Hassan';
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _price.dispose();
    _seats.dispose();
    _schedule.dispose();
    _duration.dispose();
    _location.dispose();
    super.dispose();
  }

  void _save(String status) {
    if (!_form.currentState!.validate()) return;
    final existing = widget.initial;
    final seats = int.tryParse(_seats.text) ?? 16;
    final enrolled = existing?.seatsTaken ?? 0;
    final item = AppClass(
      id: existing?.id ?? 'managed-${DateTime.now().millisecondsSinceEpoch}',
      title: _title.text.trim(),
      subject: _subject,
      city: _location.text.trim().isEmpty ? 'Cairo' : _location.text.trim(),
      priceEgp: int.tryParse(_price.text) ?? 0,
      bookingsCount: enrolled,
      format: _format,
      curriculum: existing?.curriculum ?? 'NATIONAL',
      language: existing?.language ?? 'Arabic',
      description: _description.text.trim(),
      location: _location.text.trim(),
      gradeLevel: existing?.gradeLevel ?? 'Grade 10',
      schedule: _schedule.text.trim(),
      capacity: seats,
      spotsLeft: seats - enrolled,
      totalSeats: seats,
      enrolledSeats: enrolled,
      durationMinutes: int.tryParse(_duration.text) ?? 90,
      level: _level,
      status: status,
      thumbnailUrl: existing?.thumbnailUrl,
      paymentType: _format == 'ONLINE' ? 'ONLINE' : 'IN_PERSON',
      avgRating: existing?.avgRating ?? 4.7,
      reviewCount: existing?.reviewCount ?? 0,
      providerName: widget.isCenter ? _assignedTutor : 'Amina Hassan',
      tutors: [
        TutorMini(
          id: 'tutor-${_assignedTutor.toLowerCase().split(' ').first}',
          name: _assignedTutor,
          isVerified: true,
        ),
      ],
      postClassContent: existing?.postClassContent,
    );
    Navigator.of(context).pop(item);
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.55,
      builder: (context, controller) => Form(
        key: _form,
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            Center(
              child: Container(
                width: 42,
                height: 5,
                decoration: BoxDecoration(
                  color: c.border,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              widget.initial == null
                  ? l.t('manage.addClass')
                  : l.t('manage.editClass'),
              style: TextStyle(
                color: c.text,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 14),
            _text(_title, l.t('manage.title'), required: true),
            _text(_description, l.t('manage.description'), maxLines: 3),
            Row(
              children: [
                Expanded(
                  child: _text(_price, l.t('manage.price'), number: true),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _text(_seats, l.t('manage.seats'), number: true),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(child: _text(_schedule, l.t('manage.dateTime'))),
                const SizedBox(width: 10),
                Expanded(
                  child: _text(_duration, l.t('manage.minutes'), number: true),
                ),
              ],
            ),
            _text(_location, l.t('manage.locationLink')),
            _drop(l.t('manage.subject'), _subject, subjects, (value) {
              if (value != null) setState(() => _subject = value);
            }),
            _drop(l.t('manage.sessionType'), _format, formats, (value) {
              if (value != null) setState(() => _format = value);
            }),
            _drop(
              l.t('manage.level'),
              _level,
              const ['Beginner', 'Intermediate', 'Advanced'],
              (value) {
                if (value != null) setState(() => _level = value);
              },
            ),
            if (widget.isCenter)
              _drop(
                l.t('manage.assignTutor'),
                _assignedTutor,
                const [
                  'Amina Hassan',
                  'Omar El-Sayed',
                  'Nour Adel',
                  'Karim Fouad',
                ],
                (value) {
                  if (value != null) setState(() => _assignedTutor = value);
                },
              ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.image_outlined),
              label: Text(l.t('manage.photoPlaceholder')),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _save('DRAFT'),
                    child: Text(l.t('manage.draft')),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _save('ACTIVE'),
                    child: Text(l.t('manage.publish')),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _text(
    TextEditingController controller,
    String label, {
    bool required = false,
    bool number = false,
    int maxLines = 1,
  }) {
    final l = context.l10n;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: number ? TextInputType.number : TextInputType.text,
        validator: (value) =>
            required && (value == null || value.trim().isEmpty)
            ? l.t('manage.formRequired')
            : null,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }

  Widget _drop(
    String label,
    String value,
    List<String> options,
    ValueChanged<String?> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: DropdownButtonFormField<String>(
        initialValue: options.contains(value) ? value : options.first,
        decoration: InputDecoration(labelText: label),
        items: [
          for (final option in options)
            DropdownMenuItem(value: option, child: Text(option)),
        ],
        onChanged: onChanged,
      ),
    );
  }
}

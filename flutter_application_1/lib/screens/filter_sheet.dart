import 'package:flutter/material.dart';

import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

const egyptCities = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Mansoura',
  'Tanta',
  'Zagazig',
  'Assiut',
  'Ismailia',
];

Future<ClassFilters?> showClassFilterSheet(
  BuildContext context,
  ClassFilters initial,
) {
  return showModalBottomSheet<ClassFilters>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => FilterSheet(initial: initial),
  );
}

class FilterSheet extends StatefulWidget {
  const FilterSheet({super.key, required this.initial});
  final ClassFilters initial;

  @override
  State<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<FilterSheet> {
  late List<String> _subjects;
  late String _format;
  late double _maxPrice;
  late String _city;
  late String _sortBy;

  @override
  void initState() {
    super.initState();
    _subjects = [...widget.initial.subjects];
    _format = widget.initial.format;
    _maxPrice = widget.initial.maxPrice;
    _city = widget.initial.city;
    _sortBy = widget.initial.sortBy;
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.82,
      minChildSize: 0.5,
      maxChildSize: 0.94,
      builder: (context, controller) => SafeArea(
        top: false,
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(18, 4, 18, 18),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    l.t('filter.title'),
                    style: TextStyle(
                      color: c.text,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() {
                    _subjects = [];
                    _format = '';
                    _maxPrice = 500;
                    _city = '';
                    _sortBy = 'newest';
                  }),
                  child: Text(l.t('filter.reset')),
                ),
              ],
            ),
            _Label(l.t('home.subjects')),
            ...subjects.map(
              (subject) => CheckboxListTile(
                value: _subjects.contains(subject),
                dense: true,
                contentPadding: EdgeInsets.zero,
                title: Text(subject),
                onChanged: (_) => setState(() {
                  _subjects.contains(subject)
                      ? _subjects.remove(subject)
                      : _subjects.add(subject);
                }),
              ),
            ),
            _Label(l.t('filter.format')),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilterChipButton(
                  label: l.t('filter.both'),
                  selected: _format.isEmpty,
                  onTap: () => setState(() => _format = ''),
                ),
                for (final format in formats)
                  FilterChipButton(
                    label: l.t('format.$format'),
                    selected: _format == format,
                    onTap: () => setState(() => _format = format),
                  ),
              ],
            ),
            _Label(
              '${l.t('filter.price')} ${_maxPrice.round()} ${l.t('common.egp')}',
            ),
            Slider(
              value: _maxPrice,
              min: 0,
              max: 500,
              divisions: 10,
              label: '${_maxPrice.round()}',
              onChanged: (value) => setState(() => _maxPrice = value),
            ),
            _Label(l.t('filter.city')),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: egyptCities
                  .map(
                    (city) => FilterChipButton(
                      label: city,
                      selected: _city == city,
                      onTap: () =>
                          setState(() => _city = _city == city ? '' : city),
                    ),
                  )
                  .toList(),
            ),
            _Label(l.t('filter.sort')),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _SortChip(
                  label: l.t('classes.newest'),
                  value: 'newest',
                  selected: _sortBy,
                  onTap: (value) => setState(() => _sortBy = value),
                ),
                _SortChip(
                  label: l.t('classes.popular'),
                  value: 'popular',
                  selected: _sortBy,
                  onTap: (value) => setState(() => _sortBy = value),
                ),
                _SortChip(
                  label: l.t('filter.lowestPrice'),
                  value: 'price_asc',
                  selected: _sortBy,
                  onTap: (value) => setState(() => _sortBy = value),
                ),
              ],
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () => Navigator.pop(
                context,
                ClassFilters(
                  subjects: _subjects,
                  format: _format,
                  maxPrice: _maxPrice,
                  city: _city,
                  sortBy: _sortBy,
                ),
              ),
              child: Text(l.t('filter.apply')),
            ),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 18, bottom: 10),
    child: Text(
      text,
      style: TextStyle(
        color: context.c.text,
        fontSize: 14,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}

class _SortChip extends StatelessWidget {
  const _SortChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final String value;
  final String selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) => FilterChipButton(
    label: label,
    selected: selected == value,
    onTap: () => onTap(value),
  );
}

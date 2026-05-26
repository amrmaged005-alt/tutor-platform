import 'package:intl/intl.dart';

String egp(int amount) {
  if (amount == 0) return 'Free';
  return '${NumberFormat.decimalPattern('en_EG').format(amount)} EGP';
}

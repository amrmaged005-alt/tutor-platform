import 'package:supabase_flutter/supabase_flutter.dart';
import 'constants.dart';

Future<void> initSupabase() async {
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
}

// Convenience getter used across the app:  SupabaseConfig.client.from(...)
class SupabaseConfig {
  SupabaseConfig._();
  static SupabaseClient get client => Supabase.instance.client;
}

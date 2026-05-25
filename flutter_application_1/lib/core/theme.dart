import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const bg = Color(0xFFF1EFE9);
  static const bgAlt = Color(0xFFE8E5DD);
  static const card = Color(0xFFFBFAF6);
  static const elevated = Color(0xFFFFFFFF);
  static const text = Color(0xFF181715);
  static const textSecondary = Color(0xFF4A4843);
  static const textMuted = Color(0xFF85827A);
  static const border = Color(0xFFE3DFD3);
  static const accent = Color(0xFF0D5946);
  static const accentFg = Color(0xFFFBFAF6);
  static const accentSoft = Color(0xFFE3EBE6);
  static const rating = Color(0xFFB8861B);
  static const error = Color(0xFFA33028);

  static const darkBg = Color(0xFF15140F);
  static const darkAlt = Color(0xFF1C1B15);
  static const darkCard = Color(0xFF232118);
  static const darkText = Color(0xFFF0EEE5);
  static const darkSecondary = Color(0xFFB9B5A4);
  static const darkMuted = Color(0xFF837E6B);
  static const darkBorder = Color(0xFF2F2C21);
  static const darkAccent = Color(0xFF3FAE8C);
}

class AppTheme {
  AppTheme._();

  static ThemeData light() => _base(
    brightness: Brightness.light,
    bg: AppColors.bg,
    alt: AppColors.bgAlt,
    card: AppColors.card,
    text: AppColors.text,
    secondary: AppColors.textSecondary,
    muted: AppColors.textMuted,
    border: AppColors.border,
    accent: AppColors.accent,
    onAccent: AppColors.accentFg,
  );

  static ThemeData dark() => _base(
    brightness: Brightness.dark,
    bg: AppColors.darkBg,
    alt: AppColors.darkAlt,
    card: AppColors.darkCard,
    text: AppColors.darkText,
    secondary: AppColors.darkSecondary,
    muted: AppColors.darkMuted,
    border: AppColors.darkBorder,
    accent: AppColors.darkAccent,
    onAccent: AppColors.darkBg,
  );

  static ThemeData _base({
    required Brightness brightness,
    required Color bg,
    required Color alt,
    required Color card,
    required Color text,
    required Color secondary,
    required Color muted,
    required Color border,
    required Color accent,
    required Color onAccent,
  }) {
    final scheme = ColorScheme.fromSeed(
      seedColor: accent,
      brightness: brightness,
      primary: accent,
      surface: card,
      error: AppColors.error,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: bg,
      colorScheme: scheme.copyWith(
        primary: accent,
        onPrimary: onAccent,
        surface: card,
        onSurface: text,
        outline: border,
      ),
      fontFamily: 'Inter',
      appBarTheme: AppBarTheme(
        backgroundColor: bg,
        foregroundColor: text,
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          color: text,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.4,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: card,
        indicatorColor: accent.withValues(alpha: 0.14),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            color: states.contains(WidgetState.selected) ? accent : muted,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: border),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: card,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 12,
        ),
        hintStyle: TextStyle(color: muted, fontSize: 14),
        labelStyle: TextStyle(color: secondary, fontSize: 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: accent, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: onAccent,
          elevation: 0,
          minimumSize: const Size(44, 48),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: text,
          minimumSize: const Size(44, 48),
          side: BorderSide(color: border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: accent,
          minimumSize: const Size(44, 44),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: alt,
        selectedColor: accent.withValues(alpha: 0.13),
        labelStyle: TextStyle(
          color: secondary,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
        side: BorderSide(color: border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      extensions: [
        AppThemeTokens(
          bg: bg,
          alt: alt,
          card: card,
          text: text,
          secondary: secondary,
          muted: muted,
          border: border,
          accent: accent,
          onAccent: onAccent,
        ),
      ],
    );
  }
}

class AppThemeTokens extends ThemeExtension<AppThemeTokens> {
  const AppThemeTokens({
    required this.bg,
    required this.alt,
    required this.card,
    required this.text,
    required this.secondary,
    required this.muted,
    required this.border,
    required this.accent,
    required this.onAccent,
  });

  final Color bg;
  final Color alt;
  final Color card;
  final Color text;
  final Color secondary;
  final Color muted;
  final Color border;
  final Color accent;
  final Color onAccent;

  @override
  AppThemeTokens copyWith({
    Color? bg,
    Color? alt,
    Color? card,
    Color? text,
    Color? secondary,
    Color? muted,
    Color? border,
    Color? accent,
    Color? onAccent,
  }) => AppThemeTokens(
    bg: bg ?? this.bg,
    alt: alt ?? this.alt,
    card: card ?? this.card,
    text: text ?? this.text,
    secondary: secondary ?? this.secondary,
    muted: muted ?? this.muted,
    border: border ?? this.border,
    accent: accent ?? this.accent,
    onAccent: onAccent ?? this.onAccent,
  );

  @override
  AppThemeTokens lerp(ThemeExtension<AppThemeTokens>? other, double t) {
    if (other is! AppThemeTokens) return this;
    return AppThemeTokens(
      bg: Color.lerp(bg, other.bg, t)!,
      alt: Color.lerp(alt, other.alt, t)!,
      card: Color.lerp(card, other.card, t)!,
      text: Color.lerp(text, other.text, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      border: Color.lerp(border, other.border, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      onAccent: Color.lerp(onAccent, other.onAccent, t)!,
    );
  }
}

extension ThemeTokensX on BuildContext {
  AppThemeTokens get c => Theme.of(this).extension<AppThemeTokens>()!;
}

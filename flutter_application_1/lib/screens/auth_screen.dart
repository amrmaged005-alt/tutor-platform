import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

enum AuthMode { login, signup }

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.mode});
  final AuthMode mode;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String _role = 'STUDENT';

  bool get isSignup => widget.mode == AuthMode.signup;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      if (isSignup) {
        await context.app.signup(
          name: _name.text,
          email: _email.text,
          password: _password.text,
          role: _role,
        );
      } else {
        await context.app.login(_email.text, _password.text);
      }
      if (mounted) context.go('/');
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

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final app = context.app;

    return Scaffold(
      backgroundColor: c.bg,
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            children: [
              const SizedBox(height: 48),
              // Logo
              const Center(child: BrandMark()),
              const SizedBox(height: 36),
              // Title
              Text(
                isSignup ? l.t('auth.signupTitle') : l.t('auth.loginTitle'),
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: c.accent,
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.8,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                isSignup ? l.t('auth.signupSub') : l.t('auth.loginSub'),
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: c.secondary,
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              // Form card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: c.card,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: c.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (isSignup) ...[
                      _RoleTabs(
                        role: _role,
                        onRole: (r) => setState(() => _role = r),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _name,
                        textInputAction: TextInputAction.next,
                        decoration: InputDecoration(
                          labelText: l.t('auth.name'),
                          prefixIcon: Icon(
                            Icons.person_outline_rounded,
                            color: c.muted,
                          ),
                        ),
                        validator: (v) =>
                            (v == null || v.trim().length < 2)
                            ? l.t('auth.nameRequired')
                            : null,
                      ),
                      const SizedBox(height: 14),
                    ],
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      autofillHints: const [AutofillHints.email],
                      decoration: InputDecoration(
                        labelText: l.t('auth.email'),
                        hintText: l.t('common.emailExample'),
                        prefixIcon: Icon(
                          Icons.mail_outline_rounded,
                          color: c.muted,
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return l.t('auth.emailRequired');
                        }
                        if (!v.contains('@')) return l.t('auth.emailInvalid');
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      decoration: InputDecoration(
                        labelText: l.t('auth.password'),
                        prefixIcon: Icon(
                          Icons.lock_outline_rounded,
                          color: c.muted,
                        ),
                        suffixIcon: IconButton(
                          onPressed: () =>
                              setState(() => _obscure = !_obscure),
                          icon: Icon(
                            _obscure
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: c.muted,
                          ),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) {
                          return l.t('auth.passwordRequired');
                        }
                        if (v.length < 8) return l.t('auth.passwordShort');
                        return null;
                      },
                    ),
                    if (!isSignup) ...[
                      Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: TextButton(
                          onPressed: () => _showForgot(context),
                          child: Text(
                            l.t('auth.forgot'),
                            style: TextStyle(
                              color: c.accent,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ] else
                      const SizedBox(height: 20),
                    // Submit button
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _submit,
                        child: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                isSignup
                                    ? l.t('auth.signUp')
                                    : l.t('auth.signIn'),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // OR divider
                    Row(
                      children: [
                        Expanded(child: Divider(color: c.border)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 14),
                          child: Text(
                            'or',
                            style: TextStyle(color: c.muted, fontSize: 13),
                          ),
                        ),
                        Expanded(child: Divider(color: c.border)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Toggle login / signup
                    Center(
                      child: GestureDetector(
                        onTap: () =>
                            context.go(isSignup ? '/login' : '/signup'),
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(
                              color: c.secondary,
                              fontSize: 14,
                            ),
                            children: isSignup
                                ? [
                                    TextSpan(
                                      text: l.t('auth.hasAccount'),
                                    ),
                                  ]
                                : _noAccountSpan(l, c),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              // Language toggle pill
              Center(
                child: _LangPill(app: app),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  List<InlineSpan> _noAccountSpan(AppLocalizations l, AppThemeTokens c) {
    final full = l.t('auth.noAccount');
    final signUp = l.t('auth.signUp');
    final idx = full.indexOf(signUp);
    if (idx < 0) {
      return [
        TextSpan(
          text: full,
          style: TextStyle(color: c.accent, fontWeight: FontWeight.w800),
        ),
      ];
    }
    return [
      TextSpan(text: full.substring(0, idx)),
      TextSpan(
        text: signUp,
        style: TextStyle(
          color: c.accent,
          fontWeight: FontWeight.w800,
        ),
      ),
      if (idx + signUp.length < full.length)
        TextSpan(text: full.substring(idx + signUp.length)),
    ];
  }

  void _showForgot(BuildContext context) {
    final l = context.l10n;
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.t('auth.forgot')),
        content: Text(l.t('auth.forgotBody')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l.t('common.close')),
          ),
        ],
      ),
    );
  }
}

class _LangPill extends StatelessWidget {
  const _LangPill({required this.app});
  final AppState app;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: c.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.language_rounded, size: 16, color: c.muted),
          const SizedBox(width: 8),
          _LangBtn(
            label: 'AR',
            selected: app.lang == AppLang.ar,
            onTap: () => app.setLang(AppLang.ar),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              '|',
              style: TextStyle(color: c.border, fontSize: 16),
            ),
          ),
          _LangBtn(
            label: 'EN',
            selected: app.lang == AppLang.en,
            onTap: () => app.setLang(AppLang.en),
          ),
        ],
      ),
    );
  }
}

class _LangBtn extends StatelessWidget {
  const _LangBtn({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(
          color: selected ? c.accent : c.muted,
          fontSize: 14,
          fontWeight: selected ? FontWeight.w900 : FontWeight.w600,
        ),
      ),
    );
  }
}

class _RoleTabs extends StatelessWidget {
  const _RoleTabs({required this.role, required this.onRole});
  final String role;
  final ValueChanged<String> onRole;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final roles = [
      ('STUDENT', l.t('auth.student')),
      ('TUTOR', l.t('auth.tutor')),
      ('CENTER_ADMIN', l.t('auth.center')),
    ];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: c.bg,
        border: Border.all(color: c.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: roles.map((entry) {
          final selected = entry.$1 == role;
          return Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              onTap: () => onRole(entry.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: selected ? c.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  entry.$2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: selected ? c.onAccent : c.secondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

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
    if (!_form.currentState!.validate()) {
      return;
    }
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
      if (mounted) context.go('/browse');
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
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.go('/')),
        title: const BrandMark(compact: true),
      ),
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Text(
                isSignup ? l.t('auth.signupTitle') : l.t('auth.loginTitle'),
                style: TextStyle(
                  color: c.text,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.8,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                isSignup ? l.t('auth.signupSub') : l.t('auth.loginSub'),
                style: TextStyle(color: c.secondary, fontSize: 14),
              ),
              const SizedBox(height: 22),
              if (isSignup) ...[
                _RoleTabs(
                  role: _role,
                  onRole: (role) => setState(() => _role = role),
                ),
                const SizedBox(height: 16),
                _FieldLabel(l.t('auth.name')),
                TextFormField(
                  controller: _name,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      Icons.person_outline_rounded,
                      color: c.muted,
                    ),
                    hintText: l.t('auth.name'),
                  ),
                  validator: (value) =>
                      (value == null || value.trim().length < 2)
                      ? l.t('auth.nameRequired')
                      : null,
                ),
                const SizedBox(height: 14),
              ],
              _FieldLabel(l.t('auth.email')),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                decoration: InputDecoration(
                  prefixIcon: Icon(Icons.mail_outline_rounded, color: c.muted),
                  hintText: l.t('common.emailExample'),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return l.t('auth.emailRequired');
                  }
                  if (!value.contains('@')) {
                    return l.t('auth.emailInvalid');
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              _FieldLabel(l.t('auth.password')),
              TextFormField(
                controller: _password,
                obscureText: _obscure,
                autofillHints: const [AutofillHints.password],
                decoration: InputDecoration(
                  prefixIcon: Icon(Icons.lock_outline_rounded, color: c.muted),
                  suffixIcon: IconButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(
                      _obscure
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: c.muted,
                    ),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return l.t('auth.passwordRequired');
                  }
                  if (value.length < 8) {
                    return l.t('auth.passwordShort');
                  }
                  return null;
                },
              ),
              if (!isSignup)
                Align(
                  alignment: AlignmentDirectional.centerEnd,
                  child: TextButton(
                    onPressed: () => _showForgot(context),
                    child: Text(l.t('auth.forgot')),
                  ),
                ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(isSignup ? l.t('auth.signUp') : l.t('auth.signIn')),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.go(isSignup ? '/login' : '/signup'),
                child: Text(
                  isSignup ? l.t('auth.hasAccount') : l.t('auth.noAccount'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showForgot(BuildContext context) {
    final l = context.l10n;
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.t('auth.forgot')),
        content: Text(l.t('auth.forgotBody')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l.t('common.close')),
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 7),
    child: Text(
      text,
      style: TextStyle(
        color: context.c.text,
        fontSize: 13,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}

class _RoleTabs extends StatelessWidget {
  const _RoleTabs({required this.role, required this.onRole});
  final String role;
  final ValueChanged<String> onRole;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final roles = [
      ('STUDENT', l.t('auth.student')),
      ('TUTOR', l.t('auth.tutor')),
      ('CENTER_ADMIN', l.t('auth.center')),
    ];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.c.card,
        border: Border.all(color: context.c.border),
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
                  color: selected ? context.c.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  entry.$2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: selected ? context.c.onAccent : context.c.secondary,
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

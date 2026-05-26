import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.appWatch;
    final l = context.l10n;
    final c = context.c;
    final user = app.user;
    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: Text(l.t('profile.title'))),
        body: StateView(
          icon: Icons.lock_outline_rounded,
          title: l.t('auth.loginTitle'),
          body: l.t('classes.signInToBook'),
          action: l.t('auth.signIn'),
          onAction: () => context.go('/login'),
        ),
      );
    }
    return Scaffold(
      appBar: AppBar(title: Text(l.t('profile.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: c.card,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: c.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: c.accent.withValues(alpha: 0.14),
                  child: Text(
                    (user.name.isEmpty ? user.email : user.name)
                        .substring(0, 1)
                        .toUpperCase(),
                    style: TextStyle(
                      color: c.accent,
                      fontWeight: FontWeight.w900,
                      fontSize: 22,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: c.text,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(user.email, style: TextStyle(color: c.secondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          ListTile(
            leading: const Icon(Icons.event_note_outlined),
            title: Text(l.t('dashboard.mine')),
            onTap: () => context.go('/dashboard'),
          ),
          ListTile(
            leading: const Icon(Icons.favorite_border_rounded),
            title: Text(l.t('nav.saved')),
            onTap: () => context.go('/saved'),
          ),
          SwitchListTile(
            value: app.isDark,
            onChanged: app.setDark,
            title: Text(l.t('account.theme')),
            secondary: const Icon(Icons.dark_mode_outlined),
          ),
          ListTile(
            leading: const Icon(Icons.language_rounded),
            title: Text(l.t('account.language')),
            trailing: Text(
              app.lang == AppLang.en
                  ? l.t('account.english')
                  : l.t('account.arabic'),
            ),
            onTap: () =>
                app.setLang(app.lang == AppLang.en ? AppLang.ar : AppLang.en),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () async {
              await app.logout();
              if (context.mounted) context.go('/');
            },
            child: Text(l.t('auth.logout')),
          ),
        ],
      ),
    );
  }
}

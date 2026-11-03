import 'package:flutter/material.dart';

import '../app/scope.dart';
import '../components/ui/button.dart';
import '../components/ui/field.dart';
import '../constants/icons.dart';
import '../theme/tokens.dart';

/// The person must decide before going on: an ordinary question, a destructive one (red, the danger button), or one
/// that needs a reason. Esc / the backdrop answer "no".
Future<bool> confirm(
  BuildContext context, {
  required String title,
  String? text,
  String? okLabel,
  String? cancelLabel,
  bool danger = false,
}) async {
  final r = await showDialog<bool>(
    context: context,
    barrierColor: context.tokens.scrim,
    builder: (ctx) => _ConfirmBox(title: title, text: text, okLabel: okLabel, cancelLabel: cancelLabel, danger: danger),
  );
  return r ?? false;
}

/// Asks for a reason (required) and returns it, or null when the person backed out.
Future<String?> askReason(
  BuildContext context, {
  required String title,
  String? text,
  String? placeholder,
  String? requiredText,
  String? okLabel,
  bool danger = true,
}) =>
    showDialog<String>(
      context: context,
      barrierColor: context.tokens.scrim,
      builder: (ctx) => _ReasonBox(title: title, text: text, placeholder: placeholder, requiredText: requiredText, okLabel: okLabel, danger: danger),
    );

class _Frame extends StatelessWidget {
  const _Frame({required this.title, this.text, required this.danger, required this.actions, this.body});
  final String title;
  final String? text;
  final bool danger;
  final List<Widget> actions;
  final Widget? body;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Dialog(
      insetPadding: const EdgeInsets.all(20),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(color: danger ? t.stopBg : t.a100, borderRadius: t.rMd),
                    child: Center(child: AppIconW(danger ? AppIcon.alert : AppIcon.question, size: 20, color: danger ? t.stopFg : t.a800)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: context.textTheme.titleMedium),
                        if (text != null) ...[const SizedBox(height: 4), Text(text!, style: TextStyle(color: t.muted, fontSize: AppTokens.textMd))],
                      ],
                    ),
                  ),
                ],
              ),
              if (body != null) ...[const SizedBox(height: 14), body!],
              const SizedBox(height: 18),
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [for (final a in actions) Padding(padding: const EdgeInsets.only(left: 8), child: a)]),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConfirmBox extends StatelessWidget {
  const _ConfirmBox({required this.title, this.text, this.okLabel, this.cancelLabel, required this.danger});
  final String title;
  final String? text;
  final String? okLabel;
  final String? cancelLabel;
  final bool danger;

  @override
  Widget build(BuildContext context) => _Frame(
        title: title,
        text: text,
        danger: danger,
        actions: [
          AppButton(label: cancelLabel ?? context.t('common.cancel'), onPressed: () => Navigator.of(context).pop(false)),
          AppButton(label: okLabel ?? context.t('common.ok'), variant: danger ? ButtonVariant.danger : ButtonVariant.primary, autofocus: true, onPressed: () => Navigator.of(context).pop(true)),
        ],
      );
}

class _ReasonBox extends StatefulWidget {
  const _ReasonBox({required this.title, this.text, this.placeholder, this.requiredText, this.okLabel, required this.danger});
  final String title;
  final String? text;
  final String? placeholder;
  final String? requiredText;
  final String? okLabel;
  final bool danger;

  @override
  State<_ReasonBox> createState() => _ReasonBoxState();
}

class _ReasonBoxState extends State<_ReasonBox> {
  final _c = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  void _submit() {
    final v = _c.text.trim();
    if (v.isEmpty) {
      setState(() => _error = widget.requiredText ?? context.t('demo.fb.reason.required'));
      return;
    }
    Navigator.of(context).pop(v);
  }

  @override
  Widget build(BuildContext context) => _Frame(
        title: widget.title,
        text: widget.text,
        danger: widget.danger,
        body: AppTextField(
          controller: _c,
          placeholder: widget.placeholder,
          autofocus: true,
          maxLines: 3,
          errorText: _error,
          onChanged: (_) {
            if (_error != null) setState(() => _error = null);
          },
          onSubmitted: (_) => _submit(),
        ),
        actions: [
          AppButton(label: context.t('common.cancel'), onPressed: () => Navigator.of(context).pop()),
          AppButton(label: widget.okLabel ?? context.t('common.ok'), variant: widget.danger ? ButtonVariant.danger : ButtonVariant.primary, onPressed: _submit),
        ],
      );
}

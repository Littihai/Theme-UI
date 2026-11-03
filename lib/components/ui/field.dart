import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

/// A labelled control: the label, the control, a hint, and the error under it (a mistake the person must fix is shown
/// here, beside the field, never as a toast).
class Field extends StatelessWidget {
  const Field({super.key, required this.label, required this.child, this.hint, this.error, this.required = false});
  final String label;
  final Widget child;
  final String? hint;
  final String? error;
  final bool required;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Text.rich(TextSpan(children: [
            TextSpan(text: label),
            if (required) TextSpan(text: ' *', style: TextStyle(color: t.stopFg)),
          ]), style: TextStyle(fontSize: AppTokens.textSm, fontWeight: FontWeight.w500, color: t.n800)),
        ),
        child,
        if (error != null)
          Padding(
            padding: const EdgeInsets.only(top: 5),
            child: Row(children: [
              AppIconW(AppIcon.alert, size: 14, color: t.stopFg),
              const SizedBox(width: 5),
              Expanded(child: Text(error!, style: TextStyle(fontSize: AppTokens.textXs, color: t.stopFg))),
            ]),
          )
        else if (hint != null)
          Padding(padding: const EdgeInsets.only(top: 5), child: Text(hint!, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted))),
      ],
    );
  }
}

/// The text input at the house height; [errorText] paints the red border (the sentence itself goes in [Field]).
class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    this.controller,
    this.placeholder,
    this.obscure = false,
    this.prefixIcon,
    this.suffix,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.errorText,
    this.maxLines = 1,
    this.enabled = true,
    this.keyboardType,
    this.textInputAction,
    this.small = false,
    this.focusNode,
    this.autofillHints,
  });

  final TextEditingController? controller;
  final String? placeholder;
  final bool obscure;
  final AppIcon? prefixIcon;
  final Widget? suffix;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final String? errorText;
  final int maxLines;
  final bool enabled;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool small;
  final FocusNode? focusNode;
  final Iterable<String>? autofillHints;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final h = small ? AppTokens.controlHSm : AppTokens.controlH;
    final field = TextField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscure,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      maxLines: maxLines,
      enabled: enabled,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      autofillHints: autofillHints,
      style: TextStyle(fontSize: small ? AppTokens.textSm : AppTokens.textMd, color: t.text),
      decoration: InputDecoration(
        hintText: placeholder,
        prefixIcon: prefixIcon == null ? null : Padding(padding: const EdgeInsets.only(left: 10, right: 6), child: AppIconW(prefixIcon!, size: 16, color: t.n500)),
        prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        suffixIcon: suffix,
        suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: maxLines > 1 ? 12 : (h - 22) / 2),
        // the sentence is drawn by Field; here the border only
        errorText: errorText == null ? null : '',
        errorStyle: const TextStyle(height: 0, fontSize: 0),
      ),
    );
    return maxLines > 1 ? field : SizedBox(height: h, child: field);
  }
}

/// Cannot save: the summary above the form, pointing at the field errors under it.
class FormAlert extends StatelessWidget {
  const FormAlert(this.text, {super.key, this.tone = StatusTone.stop});
  final String text;
  final StatusTone tone;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final c = t.tone(tone);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: c.bg, borderRadius: t.rMd, border: Border.all(color: c.solid.withValues(alpha: 0.35))),
      child: Row(children: [
        AppIconW(tone == StatusTone.ok ? AppIcon.checkCircle : AppIcon.alert, size: 16, color: c.fg),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(color: c.fg, fontSize: AppTokens.textSm))),
      ]),
    );
  }
}

/// A labelled checkbox row.
class AppCheckbox extends StatelessWidget {
  const AppCheckbox({super.key, required this.value, required this.onChanged, required this.label});
  final bool value;
  final ValueChanged<bool> onChanged;
  final String label;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: context.tokens.rSm,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          SizedBox(width: 20, height: 20, child: Checkbox(value: value, onChanged: (v) => onChanged(v ?? false))),
          const SizedBox(width: 8),
          Flexible(child: Text(label, style: const TextStyle(fontSize: AppTokens.textMd))),
        ]),
      ),
    );
  }
}

/// Keeps a number field numeric.
final digitsOnly = FilteringTextInputFormatter.digitsOnly;

// ignore_for_file: file_names, override_on_non_overriding_member, unused_import, deprecated_member_use, prefer_const_constructors

import 'package:eveno/Constance/theme.dart';
import 'package:flutter/material.dart';

class MyTextFieald extends StatefulWidget {
  final String hintText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final TextInputType keyboardtype;
  final bool hideTextfild;
  final VoidCallback click;

  const MyTextFieald({
    super.key,
    required this.hintText,
    required this.prefixIcon,
    required this.suffixIcon,
    this.keyboardtype = TextInputType.text,
    this.hideTextfild = false,
    required this.click,
  });

  @override
  State<MyTextFieald> createState() => _MyTextFiealdState();
}

class _MyTextFiealdState extends State<MyTextFieald> {
  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(15),
      child: Container(
        height: 50,
        color:
            AppTheme.isLightTheme ? HexColor("#FAFAFA") : HexColor("#1F222A"),
        child: TextFormField(
          onTap: (() {
            widget.click();
          }),
          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontSize: 14,
              ),
          decoration: InputDecoration(
              hintText: widget.hintText,
              prefixIcon: widget.prefixIcon,
              suffixIcon: widget.suffixIcon,
              border: InputBorder.none,
               contentPadding: EdgeInsets.only(left: 14,top: 16),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide(
                      color: Theme.of(context).primaryColor, width: 1.5))),
        ),
      ),
    );
  }
}

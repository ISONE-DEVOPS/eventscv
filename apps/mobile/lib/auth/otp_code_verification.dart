// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/auth/create_new_password.dart';
import 'package:flutter/material.dart';
import 'package:flutter_otp_text_field/flutter_otp_text_field.dart';

class ForgotPasswordOtp extends StatefulWidget {
  ForgotPasswordOtp({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordOtp> createState() => _ForgotPasswordOtpState();
}

class _ForgotPasswordOtpState extends State<ForgotPasswordOtp> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: InkWell(
        onTap: () {
          FocusScope.of(context).unfocus();
        },
        child: Padding(
          padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: MediaQuery.of(context).padding.top + 16,
              bottom: MediaQuery.of(context).padding.bottom + 16),
          child: Column(
            children: [
              Row(
                children: [
                  InkWell(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Image.asset(
                      AppTheme.isLightTheme
                          ? ConstanceData.s1
                          : ConstanceData.ds1,
                      height: 30,
                    ),
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  Text(
                    "OTP Code Verification",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              SizedBox(
                height: 40,
              ),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    Text(
                      "Code has been send to +1 111 ******99",
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 14,
                          ),
                    ),
                    SizedBox(
                      height: 40,
                    ),
                    OtpTextField(
                      numberOfFields: 4,
                      focusedBorderColor: Theme.of(context).primaryColor,
                      showFieldAsBox: true,
                      fieldWidth: 70,
                      autoFocus: true,
                      textStyle:
                          Theme.of(context).textTheme.bodyLarge!.copyWith(
                                color: Theme.of(context).primaryColor,
                                fontSize: 18,
                              ),
                      // fillColor: HexColor("#FAFAFC"),
                      keyboardType: TextInputType.number,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    SizedBox(
                      height: 40,
                    ),
                    Text(
                      "Resend code in 55 s",
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 14,
                          ),
                    ),
                    SizedBox(
                      height: 40,
                    ),
                  ],
                ),
              ),
              MyButton(
                  btnName: "Verify",
                  click: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CreateNewPassword(),
                      ),
                    );
                  })
            ],
          ),
        ),
      ),
    );
  }
}

// ignore_for_file: prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class LinkedAccountScreen extends StatefulWidget {
  const LinkedAccountScreen({super.key});

  @override 
  State<LinkedAccountScreen> createState() => _LinkedAccountScreenState();
}

class _LinkedAccountScreenState extends State<LinkedAccountScreen> {
  bool switchValue = true;
  bool switchValue2 = true;
  bool switchValue3 = true;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
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
                  "Linked Accounts",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Row(
              children: [
                Image.asset(
                  ConstanceData.s4,
                  height: 30,
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Google",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                CupertinoSwitch(
                  value: switchValue,
                  activeColor: Theme.of(context).primaryColor,
                  onChanged: (bool? value) {
                    setState(() {
                      switchValue = value ?? false;
                    });
                  },
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Row(
              children: [
                Image.asset(
                  AppTheme.isLightTheme ? ConstanceData.s5 : ConstanceData.ds5,
                  height: 30,
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Apple",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                CupertinoSwitch(
                  value: switchValue2,
                  activeColor: Theme.of(context).primaryColor,
                  onChanged: (bool? value) {
                    setState(() {
                      switchValue2 = value ?? false;
                    });
                  },
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
            Row(
              children: [
                Image.asset(
                  ConstanceData.s3,
                  height: 30,
                ),
                SizedBox(
                  width: 10,
                ),
                Text(
                  "Facebook",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                CupertinoSwitch(
                  value: switchValue3,
                  activeColor: Theme.of(context).primaryColor,
                  onChanged: (bool? value) {
                    setState(() {
                      switchValue3 = value ?? false;
                    });
                  },
                ),
              ],
            ),
            SizedBox(
              height: 20,
            ),
          ],
        ),
      ),
    );
  }
}

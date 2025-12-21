// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:flutter/material.dart';

class SettingsLanguage extends StatefulWidget {
  SettingsLanguage({Key? key}) : super(key: key);

  @override
  State<SettingsLanguage> createState() => _SettingsLanguageState();
}

class _SettingsLanguageState extends State<SettingsLanguage> {
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
          crossAxisAlignment: CrossAxisAlignment.start,
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
                  "Language",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.all(0),
                children: [
                  Text(
                    "Suggested",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Text(
                        "English (US)",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      Spacer(),
                      Image.asset(
                        AppTheme.isLightTheme
                            ? ConstanceData.k24
                            : ConstanceData.k24,
                        height: 20,
                      ),
                    ],
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  com("English (UK)"),
                  SizedBox(
                    height: 20,
                  ),
                  Divider(),
                  SizedBox(
                    height: 20,
                  ),
                  Text(
                    "Language",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  SizedBox(
                    height: 30,
                  ),
                  com("Mandarin"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Hindi"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Spanish"),
                  SizedBox(
                    height: 30,
                  ),
                  com("French"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Arabic"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Bengali"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Russian"),
                  SizedBox(
                    height: 30,
                  ),
                  com("Indonesia"),
                  SizedBox(
                    height: 30,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com(String tex) {
    return Row(
      children: [
        Text(
          tex,
          style: Theme.of(context)
              .textTheme
              .bodyLarge!
              .copyWith(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        Spacer(),
        Image.asset(
          AppTheme.isLightTheme ? ConstanceData.k25 : ConstanceData.k25,
          height: 20,
        ),
      ],
    );
  }
}

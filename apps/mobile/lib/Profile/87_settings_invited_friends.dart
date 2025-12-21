// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:flutter/material.dart';

class SettingsInviteFriens extends StatefulWidget {
  SettingsInviteFriens({Key? key}) : super(key: key);

  @override
  State<SettingsInviteFriens> createState() => _SettingsInviteFriensState();
}

class _SettingsInviteFriensState extends State<SettingsInviteFriens> {
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
                  "Invite Friends",
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
                  com(ConstanceData.r5, "Lauralee Quintero", "+1-300-555-0135"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.r6, "Annabel Rohan", "+1-202-555-0136"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r7, "Alfonzo Schuessler",
                      "+1-300-555-0119"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r8, "Augustina Midgett", "+1-300-555-0161"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.r9, "Freida Varnes", "+1-300-555-0136"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r10, "Francene Vandyne", "+1-202-555-0167"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r11, "Geoffrey Mott", "+1-202-555-0119"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.r12, "Rayford Chenail", "+1-202-555-0171"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.r13, "Florencio Dorrance",
                      "+1-300-555-0171"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.r14, "Kylee Danford", "+1-202-555-0167"),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com(String img, String tex1, String tex2) {
    return Row(
      children: [
        Image.asset(
          img,
          height: 50,
        ),
        SizedBox(
          width: 10,
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tex1,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(
              height: 10,
            ),
            Text(
              tex2,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontSize: 12, color: Theme.of(context).disabledColor),
            )
          ],
        ),
        Spacer(),
        Container(
          height: 30,
          width: 65,
          decoration: BoxDecoration(
            color: AppTheme.isLightTheme
                ? Theme.of(context).primaryColor
                : HexColor("#35383F"),
            borderRadius: BorderRadius.all(Radius.circular(20)),
          ),
          child: Center(
            child: Text(
              "Invite",
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white),
            ),
          ),
        )
      ],
    );
  }

  Widget com2(String img, String tex1, String tex2) {
    return Row(
      children: [
        Image.asset(
          img,
          height: 50,
        ),
        SizedBox(
          width: 10,
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tex1,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(
              height: 10,
            ),
            Text(
              tex2,
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).disabledColor),
            )
          ],
        ),
        Spacer(),
        Container(
          height: 30,
          width: 65,
          decoration: BoxDecoration(
            border: Border.all(
                color: AppTheme.isLightTheme
                    ? Theme.of(context).primaryColor
                    : HexColor("#35383F"),
                width: 2),
            borderRadius: BorderRadius.all(Radius.circular(20)),
          ),
          child: Center(
            child: Text(
              "Invite",
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor),
            ),
          ),
        )
      ],
    );
  }
}

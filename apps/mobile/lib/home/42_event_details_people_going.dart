// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:flutter/material.dart';

class EventDetailsPeopleGoingScreen extends StatefulWidget {
  EventDetailsPeopleGoingScreen({Key? key}) : super(key: key);

  @override
  State<EventDetailsPeopleGoingScreen> createState() =>
      _EventDetailsPeopleGoingScreenState();
}

class _EventDetailsPeopleGoingScreenState
    extends State<EventDetailsPeopleGoingScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: MediaQuery.of(context).padding.top + 20,
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
                  "20,000+ Going",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                Image.asset(
                  AppTheme.isLightTheme ? ConstanceData.n6 : ConstanceData.dn1,
                  height: 25,
                ),
              ],
            ),
            SizedBox(
              height: 30,
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  com(ConstanceData.n40, "Leatrice Handler"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.n41, "Tanner Stafford"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n42, "Chantal Shelburne"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.n43, "Maryland Winkles"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n44, "Sanjuanita Ordonez"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n45, "Marci Senter"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n46, "Elanor Pera"),
                  SizedBox(
                    height: 20,
                  ),
                  com2(ConstanceData.n47, "Marielle Wigington"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n48, "Rodolfo Goode"),
                  SizedBox(
                    height: 20,
                  ),
                  com(ConstanceData.n49, "Rochel Foose"),
                  SizedBox(
                    height: 20,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget com(String img, String tex) {
    return Row(
      children: [
        Image.asset(
          img,
          height: 45,
        ),
        SizedBox(
          width: 10,
        ),
        Text(
          tex,
          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
        ),
        Spacer(),
        Container(
          height: 30,
          width: 70,
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor,
            borderRadius: BorderRadius.all(Radius.circular(30)),
          ),
          child: Center(
            child: Text(
              "Follow",
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
            ),
          ),
        )
      ],
    );
  }

  Widget com2(String img, String tex) {
    return Row(
      children: [
        Image.asset(
          img,
          height: 45,
        ),
        SizedBox(
          width: 10,
        ),
        Text(
          tex,
          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
        ),
        Spacer(),
        Container(
          height: 30,
          width: 80,
          decoration: BoxDecoration(
            border: Border.all(
              color: Theme.of(context).primaryColor,
            ),
            borderRadius: BorderRadius.all(Radius.circular(30)),
          ),
          child: Center(
            child: Text(
              "Following",
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
            ),
          ),
        )
      ],
    );
  }
}

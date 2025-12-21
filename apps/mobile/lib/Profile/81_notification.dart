// ignore_for_file: prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class NotifiationScreen extends StatefulWidget {
  const NotifiationScreen({super.key});

  @override
  State<NotifiationScreen> createState() => _NotifiationScreenState();
}

class _NotifiationScreenState extends State<NotifiationScreen> {
  bool switchValue = true;
  bool switchValue2 = true;
  bool switchValue3 = true;
  bool switchValue4 = true;
  bool switchValue5 = true;
  bool switchValue6 = true;
  bool switchValue7 = true;
  bool switchValue8 = true;
  bool switchValue9 = true;
  bool switchValue10 = true;
  bool switchValue11 = true;
  bool switchValue12 = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView(
        padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: MediaQuery.of(context).padding.top + 16,
            bottom: MediaQuery.of(context).padding.bottom + 16),
        children: [
          Row(
            children: [
              InkWell(
                onTap: () {
                  Navigator.pop(context);
                },
                child: Image.asset(
                  AppTheme.isLightTheme ? ConstanceData.s1 : ConstanceData.ds1,
                  height: 30,
                ),
              ),
              SizedBox(
                width: 10,
              ),
              Text(
                "Notification",
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Enable Sound & Vibrate",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Purchased Tickets",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Liked Events",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Followed Organizer",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue4,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue4 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Special Offers",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue5,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue5 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Payments",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue6,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue6 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Reminders",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue8,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue8 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Recommendations",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue9,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue9 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "App Updates",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue10,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue10 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "New Service Available",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue11,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue11 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "New Tips Available",
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              CupertinoSwitch(
                value: switchValue12,
                activeColor: Theme.of(context).primaryColor,
                onChanged: (bool? value) {
                  setState(() {
                    switchValue12 = value ?? false;
                  });
                },
              ),
            ],
          ),
          SizedBox(
            height: MediaQuery.of(context).padding.bottom + 16,
          ),
        ],
      ),
    );
  }
}

// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/auth/selfie_with_ID_card.dart';
import 'package:flutter/material.dart';

class PhotoIDCardScreen extends StatefulWidget {
  PhotoIDCardScreen({Key? key}) : super(key: key);

  @override
  State<PhotoIDCardScreen> createState() => _PhotoIDCardScreenState();
}

class _PhotoIDCardScreenState extends State<PhotoIDCardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Stack(
              alignment: Alignment.topLeft,
              children: [
                Image.asset(
                  AppTheme.isLightTheme
                      ? ConstanceData.s19
                      : ConstanceData.ds19,
                  height: MediaQuery.of(context).size.height,
                  width: MediaQuery.of(context).size.width,
                  fit: BoxFit.cover,
                ),
                Padding(
                  padding: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: MediaQuery.of(context).padding.top + 16,
                  ),
                  child: Column(
                    children: [
                      InkWell(
                        onTap: () {
                          Navigator.pop(context);
                        },
                        child: Row(
                          children: [
                            Image.asset(
                              ConstanceData.ds1,
                              height: 25,
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Text(
                        "Photo ID Card",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 20,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Text(
                        "Please point the camera at the ID card",
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                      )
                    ],
                  ),
                )
              ],
            ),
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      ConstanceData.s20,
                      height: 50,
                    ),
                    SizedBox(
                      width: 20,
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => SelFieWithIdCardScreen(),
                          ),
                        );
                      },
                      child: Image.asset(
                        ConstanceData.s21,
                        height: 80,
                      ),
                    ),
                    SizedBox(
                      width: 20,
                    ),
                    Image.asset(
                      ConstanceData.s22,
                      height: 50,
                    )
                  ],
                ),
                SizedBox(
                  height: 30,
                )
              ],
            ),
          ],
        ),
      ],
    ));
  }
}

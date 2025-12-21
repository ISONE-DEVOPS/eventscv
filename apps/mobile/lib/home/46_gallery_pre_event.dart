// ignore_for_file: prefer_const_constructors, deprecated_member_use, file_names

import 'package:eveno/Constance/theme.dart';
import 'package:flutter/material.dart';

import '../Constance/constance.dart';

class GalleryPreEventScreen extends StatefulWidget {
  const GalleryPreEventScreen({super.key});

  @override
  State<GalleryPreEventScreen> createState() => _GalleryPreEventScreenState();
}

class _GalleryPreEventScreenState extends State<GalleryPreEventScreen> {
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
                  "Gallery (Pre-Event)",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Spacer(),
                Image.asset(
                  AppTheme.isLightTheme
                      ? ConstanceData.n52
                      : ConstanceData.dn52,
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
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k1)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k2)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k3)),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k4)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k5)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k6)),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k7)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k8)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k9)),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k10)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k11)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k12)),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k13)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k14)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k15)),
                    ],
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(child: Image.asset(ConstanceData.k16)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k17)),
                      SizedBox(
                        width: 10,
                      ),
                      Expanded(child: Image.asset(ConstanceData.k18)),
                    ],
                  ),
                  SizedBox(
                    height: 40,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

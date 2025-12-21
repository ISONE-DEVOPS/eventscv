// ignore_for_file: prefer_const_constructors_in_immutables, prefer_const_constructors, deprecated_member_use, use_build_context_synchronously, file_names

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/main.dart';
import 'package:flutter/material.dart';

import '../Constance/theme.dart';

class FaceRecognitionScan extends StatefulWidget {
  FaceRecognitionScan({Key? key}) : super(key: key);

  @override
  State<FaceRecognitionScan> createState() => _FaceRecognitionScanState();
}

class _FaceRecognitionScanState extends State<FaceRecognitionScan> {
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
                    ConstanceData.s26,
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
                          "Face Recognition",
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 20,
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        Text(
                          "Add a face recognition to make your account more secure.",
                          style:
                              Theme.of(context).textTheme.bodyLarge!.copyWith(
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
                  Padding(
                    padding: EdgeInsets.only(
                      left: 16,
                      right: 16,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                              color: HexColor("#EEEDFE"),
                              borderRadius:
                                  BorderRadius.all(Radius.circular(25)),
                            ),
                            child: Center(
                              child: Text(
                                "Skip",
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyLarge!
                                    .copyWith(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () async {
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  actions: <Widget>[
                                    Padding(
                                      padding: const EdgeInsets.all(15),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              Image.asset(
                                                AppTheme.isLightTheme
                                                    ? ConstanceData.s28
                                                    : ConstanceData.s28,
                                                height: 140,
                                              ),
                                            ],
                                          ),
                                          SizedBox(
                                            height: 10,
                                          ),
                                          Text(
                                            "Congratulations!",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge!
                                                .copyWith(
                                                  fontSize: 14,
                                                  color: Theme.of(context)
                                                      .primaryColor,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                          ),
                                          SizedBox(
                                            height: 10,
                                          ),
                                          Text(
                                            "Your account is ready to use. You will be redirected to the Home page in a few seconds..",
                                            textAlign: TextAlign.center,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge!
                                                .copyWith(
                                                  fontSize: 12,
                                                ),
                                          ),
                                          SizedBox(
                                            height: 20,
                                          ),
                                          Image.asset(
                                            AppTheme.isLightTheme
                                                ? ConstanceData.s29
                                                : ConstanceData.s29,
                                            height: 50,
                                          ),
                                        ],
                                      ),
                                    )
                                  ],
                                ),
                              );
                              await Future.delayed(
                                  Duration(milliseconds: 2000));
                              Navigator.pushReplacementNamed(
                                  context, Routes.HOME);
                            },
                            child: Container(
                              height: 50,
                              width: 100,
                              decoration: BoxDecoration(
                                color: Theme.of(context).primaryColor,
                                borderRadius:
                                    BorderRadius.all(Radius.circular(25)),
                              ),
                              child: Center(
                                child: Text(
                                  "Continue",
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyLarge!
                                      .copyWith(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 20,
                  )
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

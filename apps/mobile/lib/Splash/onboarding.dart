// ignore_for_file: prefer_const_constructors, deprecated_member_use

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Widget/buttons.dart';
import 'package:eveno/auth/lets_you_in.dart';
import 'package:flutter/material.dart';

class OnBoardingScreen extends StatefulWidget {
  const OnBoardingScreen({Key? key}) : super(key: key);

  @override
  State<OnBoardingScreen> createState() => _OnBoardingScreenState();
}

class _OnBoardingScreenState extends State<OnBoardingScreen> {
  int pageNumber = 0;

  final PageController _pageController = PageController();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: (value) {},
        children: [
          onBoardin1(),
          onBoardin2(),
          onBoardin3(),
        ],
      ),
    );
  }

  Widget onBoardin1() {
    return Column(
      children: [
        Expanded(
          child: Stack(
            children: [
              Image.asset(
                ConstanceData.bg,
              ),
              Image.asset(
                ConstanceData.ob2,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 16,
        ),
        Container(
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(30)),
          ),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16),
            child: Column(
              children: [
                SizedBox(
                  height: 30,
                ),
                Text(
                  "Grab all events now only in your hands",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                        fontSize: 22,
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(
                  height: 20,
                ),
                Text(
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                      ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(
                  height: 20,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      height: 8,
                      width: 30,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.all(Radius.circular(30)),
                      ),
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                  ],
                ),
                Expanded(child: SizedBox()),
                MyButton(
                    btnName: "Next",
                    click: () {
                      _pageController.jumpToPage(1);
                      setState(() {});
                    }),
                SizedBox(
                  height: 30,
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget onBoardin2() {
    return Column(
      children: [
        Expanded(
          child: Stack(
            children: [
              Image.asset(
                ConstanceData.bg,
              ),
              Image.asset(
                ConstanceData.ob4,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 16,
        ),
        Container(
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(30)),
          ),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16),
            child: Column(
              children: [
                SizedBox(
                  height: 30,
                ),
                Text(
                  "Grab all events now only in your hands",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                        fontSize: 22,
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(
                  height: 20,
                ),
                Text(
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                      ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(
                  height: 20,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    Container(
                      height: 8,
                      width: 30,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.all(Radius.circular(30)),
                      ),
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                  ],
                ),
                Expanded(child: SizedBox()),
                MyButton(
                    btnName: "Next",
                    click: () {
                      _pageController.jumpToPage(2);
                      setState(() {});
                    }),
                SizedBox(
                  height: 30,
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget onBoardin3() {
    return Column(
      children: [
         Expanded(
          child: Stack(
            children: [
              Image.asset(
                ConstanceData.bg,
              ),
              Image.asset(
                ConstanceData.ob5,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 16,
        ),
        Container(
          height: 300,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(30)),
          ),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16),
            child: Column(
              children: [
                SizedBox(
                  height: 30,
                ),
                Text(
                  "Grab all events now only in your hands",
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                        fontSize: 22,
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(
                  height: 20,
                ),
                Text(
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. ",
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        fontSize: 14,
                      ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(
                  height: 20,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    CircleAvatar(
                      backgroundColor: Theme.of(context).dividerColor,
                      radius: 5,
                    ),
                    SizedBox(
                      width: 10,
                    ),
                    Container(
                      height: 8,
                      width: 30,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        borderRadius: BorderRadius.all(Radius.circular(30)),
                      ),
                    ),
                  ],
                ),
                Expanded(child: SizedBox()),
                MyButton(
                    btnName: "Get Started",
                    click: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => LetsYouInScreen(),
                        ),
                      );
                    }),
                SizedBox(
                  height: 30,
                )
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ignore_for_file: deprecated_member_use, library_private_types_in_public_api, avoid_unnecessary_containers, sized_box_for_whitespace, constant_identifier_names, prefer_const_constructors, avoid_single_cascade_in_expression_statements

import 'package:eveno/Constance/constance.dart';
import 'package:eveno/Constance/theme.dart';
import 'package:eveno/Explore/61_maps_version1.dart';
import 'package:eveno/Favorites/66_favorites_cards.dart';
import 'package:eveno/Profile/78_profile_&_settings_full_page.dart';
import 'package:eveno/Tickets/69_tickets_cancelled.dart';
import 'package:eveno/home/home_screen.dart';
import 'package:flutter/material.dart';

class PageScreen extends StatefulWidget {
  const PageScreen({super.key});

  @override
  _PageScreenState createState() => _PageScreenState();
}

class _PageScreenState extends State<PageScreen> with TickerProviderStateMixin {
  late AnimationController animationController;
  late Widget indexView;
  BottomBarType bottomBarType = BottomBarType.Home;

  @override
  void initState() {
    animationController =
        AnimationController(duration: Duration(milliseconds: 400), vsync: this);
    indexView = HomeScreen1(
      animationController: animationController,
    );
    animationController..forward();
    super.initState();
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Scaffold(
        backgroundColor: AppTheme.getTheme().colorScheme.background,
        bottomNavigationBar: Container(
            height: 58 + MediaQuery.of(context).padding.bottom,
            child: getBottomBarUI(bottomBarType)),
        body: indexView,
      ),
    );
  }

  void tabClick(BottomBarType tabType) {
    if (tabType != bottomBarType) {
      bottomBarType = tabType;
      animationController.reverse().then((f) {
        if (tabType == BottomBarType.Home) {
          setState(() {
            indexView = HomeScreen1(
              animationController: animationController,
            );
          });
        } else if (tabType == BottomBarType.Explore) {
          setState(() {
            indexView = MapsVersion1Screen(
              animationController: animationController,
            );
          });
        } else if (tabType == BottomBarType.Favorites) {
          setState(() {
            indexView = FavoritesCardsScreen(
              animationController: animationController,
            );
          });
        } else if (tabType == BottomBarType.Tickets) {
          setState(() {
            indexView = TicketsScreen(
              animationController: animationController,
            );
          });
        } else if (tabType == BottomBarType.Profile) {
          setState(() {
            indexView = ProfileScreen(
              animationController: animationController,
            );
          });
        }
      });
    }
  }

  Widget getBottomBarUI(BottomBarType tabType) {
    return Container(
      height: 70 + MediaQuery.of(context).padding.bottom,
      decoration: BoxDecoration(
        color: AppTheme.isLightTheme ? Color(0xFFffffff) : HexColor("#111827"),
        // ignore: prefer_const_literals_to_create_immutables
        boxShadow: [
          BoxShadow(
            color: Colors.grey,
            blurRadius: 8,
            spreadRadius: 2,
            offset: Offset(5.0, 5.0),
          )
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.only(
          right: 24,
          left: 24,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () {
                tabClick(BottomBarType.Home);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 4,
                  ),
                  Image.asset(
                    ConstanceData.h1,
                    height: 26,
                    color: tabType == BottomBarType.Home
                        ? Theme.of(context).primaryColor
                        : HexColor("#b1b1ba"),
                  ),
                  Text(
                    "Home",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: tabType == BottomBarType.Home
                              ? Theme.of(context).primaryColor
                              : HexColor("#b1b1ba"),
                        ),
                  )
                ],
              ),
            ),
            InkWell(
              onTap: () {
                tabClick(BottomBarType.Explore);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 4,
                  ),
                  Image.asset(
                    ConstanceData.h2,
                    height: 26,
                    color: tabType == BottomBarType.Explore
                        ? Theme.of(context).primaryColor
                        : HexColor("#b1b1ba"),
                  ),
                  Text(
                    "Explore",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: tabType == BottomBarType.Explore
                              ? Theme.of(context).primaryColor
                              : HexColor("#b1b1ba"),
                        ),
                  )
                ],
              ),
            ),
            InkWell(
              onTap: () {
                tabClick(BottomBarType.Favorites);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 4,
                  ),
                  Image.asset(
                    ConstanceData.h3,
                    height: 26,
                    color: tabType == BottomBarType.Favorites
                        ? Theme.of(context).primaryColor
                        : HexColor("#b1b1ba"),
                  ),
                  Text(
                    "Favorites",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: tabType == BottomBarType.Favorites
                              ? Theme.of(context).primaryColor
                              : HexColor("#b1b1ba"),
                        ),
                  )
                ],
              ),
            ),
            InkWell(
              onTap: () {
                tabClick(
                  BottomBarType.Tickets,
                );
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 4,
                  ),
                  Image.asset(
                    ConstanceData.h4,
                    height: 26,
                    color: tabType == BottomBarType.Tickets
                        ? Theme.of(context).primaryColor
                        : HexColor("#b1b1ba"),
                  ),
                  Text(
                    "Tickets",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: tabType == BottomBarType.Tickets
                              ? Theme.of(context).primaryColor
                              : HexColor("#b1b1ba"),
                        ),
                  )
                ],
              ),
            ),
            InkWell(
              onTap: () {
                tabClick(BottomBarType.Profile);
              },
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 4,
                  ),
                  Image.asset(
                    ConstanceData.h5,
                    height: 26,
                    color: tabType == BottomBarType.Profile
                        ? Theme.of(context).primaryColor
                        : HexColor("#b1b1ba"),
                  ),
                  Text(
                    "Profile",
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: tabType == BottomBarType.Profile
                              ? Theme.of(context).primaryColor
                              : HexColor("#b1b1ba"),
                        ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum BottomBarType {
  Home,
  Explore,
  Favorites,
  Tickets,
  Profile,
}

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:pswoapp/models/plan_model.dart';

class Main extends StatefulWidget {
  const Main({super.key});

  @override
  State<Main> createState() => _MainState();
}

class _MainState extends State<Main> {
  // build circular progress to indicate the current meal swipes and flex dollars left
  Widget _buildCircularProgress({
    required int maxMealSwipe,
    required int currentMealSwipe,
  }) {
    return SizedBox(
      height: 100,
      width: 100,
      child: Stack(
        children: [
          SizedBox.expand(
            child: CircularProgressIndicator(
              value: currentMealSwipe / maxMealSwipe,
              backgroundColor: Colors.grey[200],
              valueColor: const AlwaysStoppedAnimation(Colors.blue),
            ),
          ),
          Center(
            child: Text(
              '${currentMealSwipe.toString()}/${maxMealSwipe.toString()}',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w600,
                color: Colors.blue,
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Plan> plans = [];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // StreamB, /plans/plan
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('plans').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Text('Something went wrong');
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Text("Loading");
          }

          // Convert the QuerySnapshot to a List<Plan> where under document 'plan' is a Map<String, dynamic> where the keys is the date in milliseconds since epoch and the values is List<dynamic>
          // plans =
          // plans =

          // print(snapshot.data!.docs[0].data()!);
          /*
    snapshot.data!.docs[0].data()! =    {1675218786351: [], 1675175613964: [], 1675148112922: [240, 222, Tax exempt balance: 111.5], 1675148152243: [240, 221, Tax exempt balance: 111.5], 1675217143727: [240, 218, Tax exempt balance: 111.5]}
          */

          (snapshot.data!.docs[0].data()! as Map).forEach((key, value) => {
                if (value.isNotEmpty)
                  {
                    plans.add(Plan.fromJson({key: value})),
                  }
              });

          print(plans);
          plans.sort((a, b) => a.date!.compareTo(b.date!));
          plans.reversed;

          // Build the UI, circular progress to indicate the current meal swipes and flex dollars left

          return Column(
            children: [
              SizedBox(
                height: MediaQuery.of(context).size.width * 0.2,
              ),
              Row(
                children: [
                  SizedBox(
                    width: MediaQuery.of(context).size.width * .1,
                  ),
                  _buildCircularProgress(
                      maxMealSwipe: Plan.latestPlan(plans)!.maxMealSwipe!,
                      currentMealSwipe:
                          Plan.latestPlan(plans)!.currentMealSwipe!),
                ],
              ),
              SizedBox(
                height: MediaQuery.of(context).size.width * 0.2,
              ),
              // Current Flex Dollars
              Row(
                children: [
                  SizedBox(
                    width: MediaQuery.of(context).size.width * .1,
                  ),
                  Text(
                    'Current Flex Dollars: \$${Plan.latestPlan(plans)!.currentFlexDollars}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue,
                    ),
                  ),
                ],
              ),
              // Sort PLans by date
              // History of Plans
              Expanded(
                child: ListView.builder(
                  itemCount: plans.length,
                  itemBuilder: (context, index) {
                    return ListTile(
                      title: Text(plans[index].date!.toString()),
                      subtitle: Text(
                          "You had ${plans[index].currentMealSwipe} meal swipes and ${plans[index].currentFlexDollars} flex dollars"),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

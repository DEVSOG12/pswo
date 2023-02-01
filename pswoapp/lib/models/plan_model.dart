class Plan {
  final DateTime? date;
  final int? maxMealSwipe;
  final int? currentMealSwipe;
  final double? currentFlexDollars;

  Plan({
    this.date,
    this.maxMealSwipe,
    this.currentMealSwipe,
    this.currentFlexDollars,
  });

  factory Plan.fromJson(Map<String, dynamic> json) {
    if (json[json.keys.first] == []) {
      return Plan(
          date: DateTime.now(),
          maxMealSwipe: 0,
          currentMealSwipe: 0,
          currentFlexDollars: 0.0);
    }
    // json is a Map<String, dynamic> where the keys is the date in milliseconds since epoch and the values is List<dynamic>
    return Plan(
      date: // Convert the date from milliseconds since epoch to a DateTime object
          DateTime.fromMillisecondsSinceEpoch(int.parse(json.keys.first)),
      maxMealSwipe: int.tryParse(json[json.keys.first][0]) ?? 0,
      currentMealSwipe: int.tryParse(json[json.keys.first][1]) ?? 0,
      currentFlexDollars: // Convert the flex dollars from a String to an int, i.e. Tax exempt balance: 111.5
          double.tryParse(json[json.keys.first][2].toString().split(' ')[3]) ??
              0.0,
    );
  }

  // Lastest plan from the list of plans
  static Plan? latestPlan(List<Plan> plans) {
    if (plans.isEmpty) return null;
    return plans.reduce((value, element) =>
        value.date!.isAfter(element.date!) ? value : element);
  }

  // The number of meal swipes left
  int? get mealSwipeLeft => currentMealSwipe!;

  // The number of flex dollars left
  double? get flexDollarsLeft => currentFlexDollars! - 0.0;

  // The number of meal swipes used
  int? get mealSwipeUsed => maxMealSwipe! - currentMealSwipe!;
}

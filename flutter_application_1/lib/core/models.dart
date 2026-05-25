class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  final String id;
  final String email;
  final String name;
  final String role;

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
    id: json['id'] as String,
    email: (json['email'] as String?) ?? '',
    name: (json['name'] as String?) ?? '',
    role: (json['role'] as String?) ?? 'STUDENT',
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'role': role,
  };
}

class AppClass {
  const AppClass({
    required this.id,
    required this.title,
    required this.subject,
    required this.city,
    required this.priceEgp,
    required this.bookingsCount,
    required this.format,
    required this.curriculum,
    required this.language,
    this.description,
    this.location,
    this.gradeLevel,
    this.schedule,
    this.capacity,
    this.spotsLeft,
    this.paymentType = 'IN_PERSON',
    this.avgRating,
    this.reviewCount = 0,
    this.providerName = 'Coursaty',
    this.tutors = const [],
  });

  final String id;
  final String title;
  final String subject;
  final String city;
  final int priceEgp;
  final int bookingsCount;
  final String format;
  final String curriculum;
  final String language;
  final String? description;
  final String? location;
  final String? gradeLevel;
  final String? schedule;
  final int? capacity;
  final int? spotsLeft;
  final String paymentType;
  final double? avgRating;
  final int reviewCount;
  final String providerName;
  final List<TutorMini> tutors;

  factory AppClass.fromJson(Map<String, dynamic> json) {
    final center = json['center'] as Map<String, dynamic>?;
    final owner = json['owner'] as Map<String, dynamic>?;
    final rawTutors = (json['tutors'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map((entry) {
          final nested = entry['tutor'];
          return nested is Map<String, dynamic> ? nested : entry;
        })
        .map(TutorMini.fromJson)
        .toList();

    return AppClass(
      id: json['id'] as String,
      title: (json['title'] as String?) ?? '',
      subject: (json['subject'] as String?) ?? '',
      city: (json['city'] as String?) ?? '',
      priceEgp: (json['priceEgp'] as num?)?.toInt() ?? 0,
      bookingsCount:
          (json['bookingsCount'] as num?)?.toInt() ??
          (json['_count']?['bookings'] as num?)?.toInt() ??
          0,
      format: (json['format'] as String?) ?? 'IN_PERSON',
      curriculum: (json['curriculum'] as String?) ?? 'NATIONAL',
      language: (json['language'] as String?) ?? 'Arabic',
      description: json['description'] as String?,
      location: json['location'] as String?,
      gradeLevel: json['gradeLevel'] as String?,
      schedule: json['schedule'] as String?,
      capacity: (json['capacity'] as num?)?.toInt(),
      spotsLeft: (json['spotsLeft'] as num?)?.toInt(),
      paymentType: (json['paymentType'] as String?) ?? 'IN_PERSON',
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      providerName:
          (center?['name'] as String?) ??
          (owner?['fullName'] as String?) ??
          (owner?['name'] as String?) ??
          (rawTutors.isNotEmpty ? rawTutors.first.name : 'Coursaty'),
      tutors: rawTutors,
    );
  }
}

class TutorMini {
  const TutorMini({
    required this.id,
    required this.name,
    this.photoUrl,
    this.isVerified = false,
  });

  final String id;
  final String name;
  final String? photoUrl;
  final bool isVerified;

  factory TutorMini.fromJson(Map<String, dynamic> json) => TutorMini(
    id: json['id'] as String,
    name: (json['fullName'] as String?) ?? (json['name'] as String?) ?? '',
    photoUrl: json['photoUrl'] as String?,
    isVerified: json['isVerified'] == true,
  );
}

class TutorProfile {
  const TutorProfile({
    required this.id,
    required this.name,
    required this.city,
    required this.subjects,
    required this.classCount,
    required this.studentCount,
    this.bio,
    this.photoUrl,
    this.centerName,
    this.avgRating,
    this.reviewCount = 0,
    this.isVerified = false,
    this.classes = const [],
  });

  final String id;
  final String name;
  final String city;
  final List<String> subjects;
  final int classCount;
  final int studentCount;
  final String? bio;
  final String? photoUrl;
  final String? centerName;
  final double? avgRating;
  final int reviewCount;
  final bool isVerified;
  final List<AppClass> classes;

  factory TutorProfile.fromJson(Map<String, dynamic> json) {
    final center = json['center'] as Map<String, dynamic>?;
    return TutorProfile(
      id: json['id'] as String,
      name: (json['fullName'] as String?) ?? (json['name'] as String?) ?? '',
      city:
          (json['city'] as String?) ?? (center?['city'] as String?) ?? 'Cairo',
      subjects: (json['subjects'] as List<dynamic>? ?? [])
          .map((item) => item.toString())
          .toList(),
      classCount: (json['classCount'] as num?)?.toInt() ?? 0,
      studentCount: (json['studentCount'] as num?)?.toInt() ?? 0,
      bio: json['bio'] as String?,
      photoUrl: json['photoUrl'] as String?,
      centerName: center?['name'] as String?,
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      isVerified: json['isVerified'] == true,
      classes: (json['classes'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(AppClass.fromJson)
          .toList(),
    );
  }
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.status,
    required this.paymentStatus,
    required this.createdAt,
    required this.classItem,
    this.amountEgp,
    this.studentName,
  });

  final String id;
  final String status;
  final String paymentStatus;
  final DateTime createdAt;
  final AppClass classItem;
  final int? amountEgp;
  final String? studentName;

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final student = json['student'] as Map<String, dynamic>?;
    return BookingItem(
      id: json['id'] as String,
      status: (json['status'] as String?) ?? 'PENDING',
      paymentStatus: (json['paymentStatus'] as String?) ?? 'UNPAID',
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
      classItem: AppClass.fromJson(json['class'] as Map<String, dynamic>),
      amountEgp: (json['amountEgp'] as num?)?.toInt(),
      studentName:
          (student?['fullName'] as String?) ?? (student?['name'] as String?),
    );
  }
}

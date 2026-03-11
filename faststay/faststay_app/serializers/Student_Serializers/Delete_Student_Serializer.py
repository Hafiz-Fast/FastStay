from rest_framework import serializers

class Delete_Student_Serializer(serializers.Serializer):
    p_StudentId = serializers.IntegerField(required=True)

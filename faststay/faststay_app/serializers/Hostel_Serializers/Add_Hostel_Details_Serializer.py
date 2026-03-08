from rest_framework import serializers
from faststay_app.utils.validators import validate_NNums

def natural_number_validator(value):
    if not validate_NNums(value):
        raise serializers.ValidationError("Value must be at least 1.")
    
class Add_Hostel_Details_serializer(serializers.Serializer):
    p_ManagerId = serializers.IntegerField()
    p_BlockNo = serializers.CharField(max_length=100)
    p_HouseNo = serializers.CharField(max_length=100)
    p_HostelType = serializers.ChoiceField(choices=['Portion','Building'])
    p_isParking = serializers.BooleanField()
    p_NumRooms = serializers.IntegerField()
    p_NumFloors = serializers.IntegerField()
    p_WaterTimings = serializers.IntegerField()
    p_CleanlinessTenure = serializers.IntegerField()
    p_IssueResolvingTenure = serializers.IntegerField()
    p_MessProvide = serializers.BooleanField()
    p_GeezerFlag = serializers.BooleanField()
    p_name = serializers.CharField()
    p_Latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    p_Longitude = serializers.DecimalField(max_digits=9, decimal_places=6)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        for field_name, field in self.fields.items():
            if isinstance(field, serializers.IntegerField):
                field.validators.append(natural_number_validator)
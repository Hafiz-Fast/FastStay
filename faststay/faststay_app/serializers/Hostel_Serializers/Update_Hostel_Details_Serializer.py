from rest_framework import serializers
from faststay_app.utils.validators import validate_NNums

def natural_number_validator(value):
    if not value:
        return
    if not validate_NNums(value):
        raise serializers.ValidationError("Value must be at least 1.")
    
class Update_Hostel_Details_serializer(serializers.Serializer):
    p_HostelId = serializers.IntegerField()
    p_BlockNo = serializers.CharField(max_length=100, required=False, allow_blank=True)
    p_HouseNo = serializers.CharField(max_length=100, required=False, allow_blank=True)
    p_HostelType = serializers.ChoiceField(choices=['Portion','Building'])
    p_isParking = serializers.BooleanField(required=False, allow_null=True)
    p_NumRooms = serializers.IntegerField(required=False, allow_null=True)
    p_NumFloors = serializers.IntegerField(required=False, allow_null=True)
    p_WaterTimings = serializers.IntegerField(required=False)
    p_CleanlinessTenure = serializers.IntegerField(required=False, allow_null=True)
    p_IssueResolvingTenure = serializers.IntegerField(required=False, allow_null=True)
    p_MessProvide = serializers.BooleanField(required=False, allow_null=True)
    p_GeezerFlag = serializers.BooleanField(required=False, allow_null=True)
    p_name = serializers.CharField()
    p_Latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    p_Longitude = serializers.DecimalField(max_digits=9, decimal_places=6)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        for field_name, field in self.fields.items():
            if isinstance(field, serializers.IntegerField):
                field.validators.append(natural_number_validator)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { UserProfileRepository } from '../../infrastructure/api/user-profile.repository';
import { UserRepository } from '../../infrastructure/api/user.repository';
import { GetUserProfileUseCase } from '../../application/use-cases/user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user-profile/update-user-profile.use-case';
import { CreateUserProfileUseCase } from '../../application/use-cases/user-profile/create-user-profile.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { UserProfile, UpdateUserProfileDto } from '../../infrastructure/api/user-profile.repository';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { useToast } from '../../shared/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Building2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  User as UserIcon,
  Edit,
  Save,
  X,
  Hash,
  Home,
} from 'lucide-react';
import { User } from '../../shared/types';
import { sanitizeText, sanitizeUrl } from '../../shared/utils/sanitize';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileDto>({});

  const userProfileRepository = new UserProfileRepository();
  const userRepository = new UserRepository();
  const getUserProfileUseCase = new GetUserProfileUseCase(userProfileRepository);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileRepository);
  const createUserProfileUseCase = new CreateUserProfileUseCase(userProfileRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, profileData] = await Promise.all([
        getUserUseCase.execute(userId!),
        getUserProfileUseCase.execute(userId!),
      ]);
      setUser(userData);
      setProfile(profileData);
      const dataToUse = profileData || {
        companyName: '',
        age: undefined,
        cnic: '',
        mobileNo: '',
        phoneNo: '',
        city: '',
        address: '',
        whatsappNo: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        dateOfBirth: '',
        bio: '',
        website: '',
      };
      setFormData({
        companyName: dataToUse.companyName || '',
        age: dataToUse.age || undefined,
        cnic: dataToUse.cnic || '',
        mobileNo: dataToUse.mobileNo || '',
        phoneNo: dataToUse.phoneNo || '',
        city: dataToUse.city || '',
        address: dataToUse.address || '',
        whatsappNo: dataToUse.whatsappNo || '',
        facebookUrl: dataToUse.facebookUrl || '',
        instagramUrl: dataToUse.instagramUrl || '',
        twitterUrl: dataToUse.twitterUrl || '',
        linkedinUrl: dataToUse.linkedinUrl || '',
        dateOfBirth: dataToUse.dateOfBirth || '',
        bio: dataToUse.bio || '',
        website: dataToUse.website || '',
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      let result: UserProfile;
      if (profile) {
        result = await updateUserProfileUseCase.execute(userId, formData);
      } else {
        result = await createUserProfileUseCase.execute({ userId, ...formData });
      }
      setProfile(result);
      setEditing(false);
      toast({
        title: 'Success',
        description: profile ? 'Profile updated successfully' : 'Profile created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    const dataToUse = profile || {
      companyName: '',
      age: undefined,
      cnic: '',
      mobileNo: '',
      phoneNo: '',
      city: '',
      address: '',
      whatsappNo: '',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      dateOfBirth: '',
      bio: '',
      website: '',
    };
    setFormData({
      companyName: dataToUse.companyName || '',
      age: dataToUse.age || undefined,
      cnic: dataToUse.cnic || '',
      mobileNo: dataToUse.mobileNo || '',
      phoneNo: dataToUse.phoneNo || '',
      city: dataToUse.city || '',
      address: dataToUse.address || '',
      whatsappNo: dataToUse.whatsappNo || '',
      facebookUrl: dataToUse.facebookUrl || '',
      instagramUrl: dataToUse.instagramUrl || '',
      twitterUrl: dataToUse.twitterUrl || '',
      linkedinUrl: dataToUse.linkedinUrl || '',
      dateOfBirth: dataToUse.dateOfBirth || '',
      bio: dataToUse.bio || '',
      website: dataToUse.website || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayData = editing ? formData : (profile || {});

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl">
                  {sanitizeText(user.firstName?.[0] || '')}{sanitizeText(user.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {sanitizeText(user.firstName || '')} {sanitizeText(user.lastName || '')}
                </h1>
                <p className="text-muted-foreground mt-1">{sanitizeText(user.email || '')}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {sanitizeText(role.name)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Age will be calculated automatically from date of birth</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={formData.cnic || ''}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12345-1234567-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {displayData?.dateOfBirth ? sanitizeText(format(new Date(displayData.dateOfBirth), 'MMMM dd, yyyy')) : 'Not set'}
                    </p>
                  </div>
                </div>
                {(displayData?.age !== null && displayData?.age !== undefined) && (
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Age</p>
                      <p className="text-sm text-muted-foreground">{displayData.age ? `${sanitizeText(String(displayData.age))} years` : ''}</p>
                    </div>
                  </div>
                )}
                {displayData?.cnic && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">CNIC</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.cnic || '')}</p>
                    </div>
                  </div>
                )}
                {displayData?.bio && (
                  <div>
                    <p className="text-sm font-medium mb-2">Bio</p>
                    <p className="text-sm text-muted-foreground">{sanitizeText(displayData.bio || '')}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Ways to reach this user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobileNo">Mobile Number</Label>
                  <Input
                    id="mobileNo"
                    value={formData.mobileNo || ''}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Phone Number</Label>
                  <Input
                    id="phoneNo"
                    value={formData.phoneNo || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                    placeholder="+92 42 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNo">WhatsApp Number</Label>
                  <Input
                    id="whatsappNo"
                    value={formData.whatsappNo || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                    placeholder="+92 300 1234567"
                  />
                </div>
              </>
            ) : (
              <>
                {displayData?.mobileNo && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Mobile</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.mobileNo || '')}</p>
                    </div>
                  </div>
                )}
                {displayData?.phoneNo && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.phoneNo || '')}</p>
                    </div>
                  </div>
                )}
                {displayData?.whatsappNo && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.whatsappNo || '')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{sanitizeText(user.email || '')}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>Location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lahore"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, area, etc."
                  />
                </div>
              </>
            ) : (
              <>
                {displayData?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">City</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.city || '')}</p>
                    </div>
                  </div>
                )}
                {displayData?.address && (
                  <div className="flex items-start gap-3">
                    <Home className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.address || '')}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>Work and company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </>
            ) : (
              <>
                {displayData?.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{sanitizeText(displayData.companyName || '')}</p>
                    </div>
                  </div>
                )}
                {displayData?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href={sanitizeUrl(displayData.website || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {sanitizeText(displayData.website || '')}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Social Media */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Social media profiles and links</CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="facebookUrl"
                    type="url"
                    value={formData.facebookUrl || ''}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="pl-9"
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={formData.instagramUrl || ''}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="pl-9"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={formData.twitterUrl || ''}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="pl-9"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="pl-9"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {displayData?.facebookUrl && (
                <a
                  href={sanitizeUrl(displayData.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Facebook</p>
                    <p className="text-xs text-muted-foreground truncate">{sanitizeText(displayData.facebookUrl)}</p>
                  </div>
                </a>
              )}
              {displayData?.instagramUrl && (
                <a
                  href={sanitizeUrl(displayData.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground truncate">{sanitizeText(displayData.instagramUrl)}</p>
                  </div>
                </a>
              )}
              {displayData?.twitterUrl && (
                <a
                  href={sanitizeUrl(displayData.twitterUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Twitter</p>
                    <p className="text-xs text-muted-foreground truncate">{sanitizeText(displayData.twitterUrl)}</p>
                  </div>
                </a>
              )}
              {displayData?.linkedinUrl && (
                <a
                  href={sanitizeUrl(displayData.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <p className="text-xs text-muted-foreground truncate">{sanitizeText(displayData.linkedinUrl)}</p>
                  </div>
                </a>
              )}
              {!displayData?.facebookUrl && !displayData?.instagramUrl && !displayData?.twitterUrl && !displayData?.linkedinUrl && (
                <p className="text-sm text-muted-foreground col-span-2">No social media profiles added</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


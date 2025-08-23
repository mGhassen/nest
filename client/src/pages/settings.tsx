import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} preferences have been updated`,
    });
  };

  return (
    <div className="p-6" data-testid="settings-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-gray-600" data-testid="text-settings-subtitle">
          Configure your account and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-settings-nav">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card data-testid="card-profile-settings">
            <CardHeader>
              <CardTitle data-testid="text-profile-title">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="John" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    defaultValue="Doe" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    data-testid="input-last-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    defaultValue="john.doe@democorp.com" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue="Europe/Paris"
                    data-testid="select-timezone"
                  >
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Africa/Tunis">Africa/Tunis (GMT+1)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => handleSave('Profile')} data-testid="button-save-profile">
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card data-testid="card-notifications-settings">
            <CardHeader>
              <CardTitle data-testid="text-notifications-title">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-email-notifications">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch defaultChecked data-testid="switch-email-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-timesheet-reminders">
                    Timesheet Reminders
                  </h4>
                  <p className="text-sm text-gray-600">Weekly reminders to submit timesheets</p>
                </div>
                <Switch defaultChecked data-testid="switch-timesheet-reminders" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-leave-notifications">
                    Leave Request Notifications
                  </h4>
                  <p className="text-sm text-gray-600">Notifications for leave request updates</p>
                </div>
                <Switch defaultChecked data-testid="switch-leave-notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-payroll-notifications">
                    Payroll Notifications
                  </h4>
                  <p className="text-sm text-gray-600">Notifications when payslips are available</p>
                </div>
                <Switch defaultChecked data-testid="switch-payroll-notifications" />
              </div>
              
              <Button onClick={() => handleSave('Notification')} data-testid="button-save-notifications">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card data-testid="card-security-settings">
            <CardHeader>
              <CardTitle data-testid="text-security-title">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-two-factor-auth">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Switch data-testid="switch-two-factor-auth" />
              </div>
              
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4" data-testid="text-active-sessions">
                  Active Sessions
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900" data-testid="text-current-session">
                        Current Session
                      </p>
                      <p className="text-xs text-gray-600">Chrome on Windows • Tunis, Tunisia</p>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
              
              <Button variant="destructive" data-testid="button-logout-all">
                Sign Out of All Devices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card data-testid="card-system-settings">
            <CardHeader>
              <CardTitle data-testid="text-system-title">System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-dark-mode">
                    Dark Mode
                  </h4>
                  <p className="text-sm text-gray-600">Enable dark theme for better visibility</p>
                </div>
                <Switch data-testid="switch-dark-mode" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900" data-testid="text-keyboard-shortcuts">
                    Keyboard Shortcuts
                  </h4>
                  <p className="text-sm text-gray-600">Enable keyboard shortcuts for navigation</p>
                </div>
                <Switch defaultChecked data-testid="switch-keyboard-shortcuts" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2" data-testid="text-language">
                  Language
                </h4>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  defaultValue="en"
                  data-testid="select-language"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              
              <Button onClick={() => handleSave('System')} data-testid="button-save-system">
                Save System Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

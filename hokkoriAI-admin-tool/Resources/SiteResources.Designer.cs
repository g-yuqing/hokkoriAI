﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace hokkoriAI_admin_tool.Resources
{
    using System;


    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "15.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    internal class SiteResources
    {

        private static global::System.Resources.ResourceManager resourceMan;

        private static global::System.Globalization.CultureInfo resourceCulture;

        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal SiteResources()
        {
        }

        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Resources.ResourceManager ResourceManager
        {
            get
            {
                if (object.ReferenceEquals(resourceMan, null))
                {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("wit_one_mgmt.Resources.SiteResources", typeof(SiteResources).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }

        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Globalization.CultureInfo Culture
        {
            get
            {
                return resourceCulture;
            }
            set
            {
                resourceCulture = value;
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}は{1}文字以内で入力してください.
        /// </summary>
        internal static string MaxLengthAttribute
        {
            get
            {
                return ResourceManager.GetString("MaxLengthAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}は必須項目です.
        /// </summary>
        internal static string RequiredAttribute
        {
            get
            {
                return ResourceManager.GetString("RequiredAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}は{1}-{2}の範囲で指定してください.
        /// </summary>
        internal static string RangeAttribute
        {
            get
            {
                return ResourceManager.GetString("RangeAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}の形式が正しくありません.
        /// </summary>
        internal static string EmailAddressAttribute
        {
            get
            {
                return ResourceManager.GetString("EmailAddressAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}は{2}から{1}字で入力してください.
        /// </summary>
        internal static string StringLengthAttribute
        {
            get
            {
                return ResourceManager.GetString("StringLengthAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}が一致していません.
        /// </summary>
        internal static string CompareAttribute
        {
            get
            {
                return ResourceManager.GetString("CompareAttribute", resourceCulture);
            }
        }

        /// <summary>
        ///   Looks up a localized string similar to {0}が一致していません.
        /// </summary>
        internal static string PasswordRequiresNonAlphanumeric
        {
            get
            {
                return ResourceManager.GetString("PasswordRequiresNonAlphanumeric", resourceCulture);
            }
        }
    }
}

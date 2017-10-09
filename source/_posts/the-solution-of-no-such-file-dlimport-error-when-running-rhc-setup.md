---
title: 安装rhc工具后执行rhc setup出现no such file dl/import错误的解决方法
id: 5
categories:
  - 运维
date: 2016-08-04 09:18:16
tags:
---

执行rhc setup后，没有提示要求输入Openshift账号和密码，出现这样的错误：

C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require': cannot load such file -- dl/import (LoadError)

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/pageant.rb:1:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/agent/socket.rb:5:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/agent.rb:22:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/key_manager.rb:4:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/session.rb:4:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh.rb:11:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/ssh_helpers.rb:18:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/wizard.rb:77:in `&lt;class:Wizard&gt;'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/wizard.rb:7:in `&lt;**module**:**RHC**&gt;'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/wizard.rb:6:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands/base.rb:4:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands/account.rb:2:in `&lt;**module**:**Commands**&gt;'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands/account.rb:1:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `**require**'

from C:/Ruby22-x64/lib/ruby/2.2.0/rubygems/core_ext/kernel_require.rb:54:in `require'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands.rb:189:in `block in load'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands.rb:188:in `each'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/commands.rb:188:in `load'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/lib/rhc/cli.rb:36:in `start'

from C:/Ruby22-x64/lib/ruby/gems/2.2.0/gems/rhc-1.35.1/bin/rhc:20:in `&lt;top (required)&gt;'

from C:/Ruby22-x64/bin/rhc:23:in `load'

from C:/Ruby22-x64/bin/rhc:23:in `&lt;main&gt;'

**解决方法：** 英文原文：

It didn't work for me as well. Eventually I used findstr under the ruby gems directory and manually changed all dl usages to fiddle. For Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/pa‌geant.rb I changed dl to fiddle in lines 1, 6 &amp; 7, I also changed Dl to Fiddle in lines 40, 42, 44, 164, 176, 180 &amp; 184\. I also **use** Highline so **I** had **to** **do** the same **in** **file** Ruby22-x64\lib\ruby\gems\2.2.0\gems\highline-1.6.19\lib\highline\system_extensi‌ons.rb, **lines** 76 &amp; 79.

大意： 我这里同样没有作用。最终我在ruby gems目录用findstr并手动将dl的用法改为fiddle。对于Ruby22-x64/lib/ruby/gems/2.2.0/gems/net-ssh-2.9.2/lib/net/ssh/authentication/pa‌geant.rb，我在第1、6、7行把dl改为fiddle，同样在第40、42、44、164、176、180、184行把Dl（实际上是DL）改为Fiddle。
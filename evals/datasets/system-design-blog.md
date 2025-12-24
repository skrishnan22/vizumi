0

# Why Netflix integrated a Service Mesh in their Backend

## We'll talk about what a service mesh is, what purpose it serves and why Netflix added one. Plus, strategies you can use to achieve your goals.

September 04, 2023

Hey Everyone!

Today we'll be talking about

- **Why Netflix Integrated a Service Mesh in their Backend**

  - A service mesh handles communication between microservices in your backend

  - Netflix previously relied on tools they built in-house for service to service communication (Eureka and Ribbon) but they’ve decided to integrate Envoy Proxy (a data plane part of the service mesh)

  - We’ll delve into what a service mesh is, why you’d use one, the data/control planes and why Netflix switched
- **A Toolkit for Achieving Goals from Andrew Huberman**

  - Andrew Huberman is a professor of neuroscience at Stanford and he runs a fantastic podcast on the latest scientific research that can improve your life

  - In the last episode, he delves into the science of setting and pursuing goals

  - Tips include rewarding yourself _randomly_, writing your goal down everyday, visualizing positive and negative consequences and more
- **Tech Snippets**

  - A Detailed Guide to Software Architecture Documentation

  - Experiences Being a Tech Lead

  - Important job interview questions engineers should ask

  - Becoming an L6 at Amazon despite getting fired from almost every job I’ve had

embeds.beehiiv.com

# embeds.beehiiv.com is blocked

This page has been blocked by an extension

- Try disabling your extensions.

ERR\_BLOCKED\_BY\_CLIENT

Reload


This page has been blocked by an extension

![](<Base64-Image-Removed>)![](<Base64-Image-Removed>)

# **Why Netflix Integrated a Service Mesh in their Backend**

Netflix is a video streaming service with over 240 million users. [They’re responsible](https://www.statista.com/chart/15692/distribution-of-global-downstream-traffic/?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend) for 15% of global internet traffic (_more_ than YouTube, which comes in at 11.4%).

The company is known for their strong engineering culture. Netflix was one of the first adopters of cloud computing (starting their migration to AWS in 2008), a pioneer in promoting the microservices architecture and also created the discipline of chaos engineering (we wrote an in-depth guide on chaos engineering that you can check out [here](https://blog.quastor.org/p/chaos-engineering-scaling-databases-linkedin)).

A few days ago, developers at Netflix published a fantastic [article](https://netflixtechblog.com/zero-configuration-service-mesh-with-on-demand-cluster-discovery-ac6483b52a51?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend) on their engineering blog explaining how and why they integrated a service mesh into their backend.

In this article, we’ll explain what a service mesh is, what purpose it serves and delve into why Netflix adopted it.

## **What is a Service Mesh**

A service mesh is an infrastructure layer that handles communication between the microservices in your backend.

As you might imagine, communication between these services can be extremely complicated, so the service mesh will handle tasks like

- **Service Discovery**\- For each microservice, new instances are constantly being spun up/down. The service mesh keeps track of the IP addresses/port number of these instances and routes requests to/from them.

- **Load Balancing** \- When one microservice calls another, you want to send that request to an instance that’s not busy (using round robin, least connections, consistent hashing, etc.). The service mesh can handle this for you.

- **Observability** \- As all communications get routed through the service mesh, it can keep track of metrics, logs and traces. Probably came in-handy during the _Love is Blind_ [fiasco](https://www.entrepreneur.com/business-news/netflix-slammed-for-love-is-blind-livestream-failure/449818?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend).

- **Resiliency** \- The service mesh can handle things like retrying requests, rate limiting, timeouts, etc. to make the backend more resilient.

- **Security** \- The mesh layer can encrypt and authenticate service-to-service communications. You can also configure access control policies to set limits on which microservice can talk to whom.

- **Deployments** \- You might have a new version for a microservice you’re rolling out and you want to run an A/B test on this. You can set the service mesh to route a certain % of requests to the old version and the rest to the new version (or some other deployment pattern)


## **Architecture of Service Mesh**

In practice, a service mesh typically consists of two components

- Data Plane

- Control Plane


### **Data Plane**

The data plane consists of lightweight proxies that are deployed alongside every instance for all of your microservices (i.e. the [sidecar pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sidecar?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)). This service mesh proxy will handle all outbound/inbound communications for the instance.

So, with Istio (a popular service mesh), you could install the [Envoy Proxy](https://www.envoyproxy.io/docs/envoy/v1.27.0/intro/what_is_envoy?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend) on all the instances of all your microservices.

### **Control Plane**

The control plane manages and configures all the data plane proxies. So you can configure things like retries, rate limiting policies, health checks, etc. in the control plane.

The control plane will also handle service discovery (keeping track of all the IP addresses for all the instances), deployments, and more.

## **Why Netflix Integrated a Service Mesh**

Netflix was one of the early adopters of a microservices architecture. A problem they had to solve was how to handle communication between microservices.

After some outages, they quickly realized they needed robust tech to handle load balancing, retries, observability and more.

They built (and open sourced) two technologies for this.

- **[Eureka](https://github.com/Netflix/eureka?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)**\- handles service discovery. Eureka keeps track of the instances for each microservice, their location and whether they need to encrypt traffic to/from that service.

- **[Ribbon](https://github.com/Netflix/ribbon?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)** \- handles load balancing, retries, timeouts and other resiliency features.


This served Netflix well over the past decade, but they added far more complexity to their microservices architecture in a number of ways.

1. **Different Protocols** \- Communication between microservices is now a mix of REST, GraphQL and gRPC (check out our tech dive on gRPC [here](https://blog.quastor.org/p/introduction-grpc-quastor-pro)).

2. **Polyglot**\- Originally, Netflix was Java-only but they’ve shifted to also support NodeJS, Python and more

3. **More Resiliency** \- Netflix wanted to integrate additional features into their proxies to make it more durable. They’re a pioneer in the area of Chaos Engineering (simulate small failures and see where that causes issues in your backend) so they wanted to add fault injection testing. They also wanted advanced load-shedding and circuit breaking features.


Netflix decided the best way to integrate these features (and add more) was to integrate Envoy, an open source service mesh proxy created at Lyft.

This integrated all the microservice-communication related features into a single implementation (rather than having multiple projects) and made the clients simpler.

Envoy has a ton of critical features around resiliency but is also very extensible. Envoy proxy is the _data plane_ part of the service mesh architecture we discussed earlier. You can also integrate a control plane by using something like Istio or by [building your own](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend).

This is a high level overview of _why_ Netflix integrated a service mesh.

If you’d like to learn about the process of integrating Envoy, then you can read more details in the full blog post [here](https://netflixtechblog.com/zero-configuration-service-mesh-with-on-demand-cluster-discovery-ac6483b52a51?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend).

embeds.beehiiv.com

# embeds.beehiiv.com is blocked

This page has been blocked by an extension

- Try disabling your extensions.

ERR\_BLOCKED\_BY\_CLIENT

Reload


This page has been blocked by an extension

![](<Base64-Image-Removed>)![](<Base64-Image-Removed>)

# **Tech Snippets**

[A Detailed Guide to Software Architecture Documentation\\
\\
This is a fantastic guide to documenting things in your codebase that aren’t code.\\
\\
You should be documenting things like\\
\- non-functional requirements\\
\- architectural decisions and their arguments\\
\- data flow\\
\- maintenance and update procedures\\
\\
and much more.\\
\\
This is a fantastic guide on how to document all these other areas of your system.\\
\\
www.workingsoftware.dev/software-architecture-documentation-the-ultimate-guide](https://www.workingsoftware.dev/software-architecture-documentation-the-ultimate-guide/?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)

[Tech Leading as a Mobile Engineer at Monzo\\
\\
This is an interesting blog post on an engineer’s first experience as a tech lead. He talks about what tactics he employed and how they benefited his team.\\
\\
One piece of advice he gives is to focus on your strengths and unique viewpoints rather than molding into the standard backend tech lead.\\
\\
monzo.com/blog/2023/08/23/tech-leading-as-a-mobile-engineer-at-monzo\\
\\
![](https://images.ctfassets.net/ro61k101ee59/LdJAhhHSJCMziHQqV5HIb/18fd82396c7dd1558181947fd222b676/Preview_Link__1___1_.png)](https://monzo.com/blog/2023/08/23/tech-leading-as-a-mobile-engineer-at-monzo?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)

[Got PIP’d in every job I’ve had. Now an L6 at Amazon\\
\\
Blind can be a pretty toxic place but every now and then there’s a pretty hilarious post.\\
\\
This is a post from an engineer at Amazon on how he became an L6 (Senior Software Engineer) despite getting fired from almost every place he’s worked at (due to coasting on the job).\\
\\
His strategy is to just get really good at interviewing (he does a ton of competitive coding and interview practice) and then just interviews at a new FAANG once he gets PIP’d.\\
\\
He’s never been promoted at any of his past jobs.\\
\\
https://www.teamblind.com/post/Got-PIPed-in-almost-every-job-Ive-held-No-regrets-jvteqCYq](https://www.teamblind.com/post/Got-PIPed-in-almost-every-job-Ive-held-No-regrets-jvteqCYq?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)

[The really important job interview questions engineers should ask\\
\\
This is a good list of questions you should ask when you’re interviewing for a job (especially if it’s a start up).\\
\\
Questions include\\
\- Does the company have product-market fit?\\
\- How much runway does the company have? What’s the burn?\\
\- What’s in store for the future? What is the company strategy?\\
\- Who decides what to build?\\
\\
and more.\\
\\
posthog.com/blog/what-to-ask-in-interviews\\
\\
![](https://posthog.com/og-images/blogwhat-to-ask-in-interviews.jpeg)](https://posthog.com/blog/what-to-ask-in-interviews?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend)

# **Advice on Setting and Pursuing Goals**

Andrew Huberman is a neurobiology professor at Stanford and he runs a fantastic podcast called Huberman lab. In the pod, he does several hour-long deep dives into neuroscience with a practical focus on how you can use the latest scientific research to improve your life.

His [latest episode](https://www.youtube.com/watch?v=CrtR12PBKb0&utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend) is on goals and what the scientific literature on setting/pursuing goals advises. There’s a ton of clinical studies on what makes effective goals and how people can best pursue them.

Huberman spends 90 minutes doing a review of the literature and he gives the best tips on what you should be doing.

_**Here’s a summary**_

Huberman starts by talking about what parts of the brain are most responsible for goal setting and pursuit.

He breaks it down into

- Amygdala

- Basal ganglia

- Lateral prefrontal cortex

- Orbitofrontal cortex


All of these areas of the brain perform many functions and goal setting/pursuit is one result.

I’m focusing on the practical tips in this summary, but if you’d like a more in-depth dive into the neuroscience then I’d recommend checking out this [talk](https://www.youtube.com/watch?v=t1F7EEGPQwo&utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend).

**Tip #1 - Choose a Priority Goal and Make it Clear and Specific**

Trying to achieve many goals simultaneously often results in failure for all of them. Instead, it’s better to set one or two high-priority goals that you’ll be focusing on for the next few months.

These goals should be _clear and specific_. You should _focus on verbs_when defining your goal and set highly specific actions that will help you achieve your overarching goal.

Rather than having the goal “_get healthy_”, a better one could be to _“run a 6 minute mile”_. The mile goal can be broken down into _“run 3 miles every day”._

**Tip #2 - Write it Down Every Day**

Something that’s commonly recommended is to write your goal on a post it note and stick it somewhere where you’ll see it (_on a fridge, on a computer monitor, etc._). The issue with this approach is that it’ll quickly become a part of your environment and your visual system will adapt to it. You’ll start to filter the reminders out.

A _better_ approach is to write your goal down every day. You can do this in a journal or on a post-it note, but it’s better to _write it by hand_ compared to typing it. Writing by pen/pencil has been shown to engage neural circuitry in a way that’s different than typing with your thumbs.

**Tip #3 - Don’t tell the World**

Another fallacy with goals is that you should try to “increase accountability” by telling all your friends/family about the goal you’re trying to achieve.

Instead, the positive feedback that you get from others when you announce the goal can be counter-productive. It activates certain reward systems within the brain (boost of dopamine and other neurochemicals) that can quickly diminish the probability that you’ll engage in the behavior.

Instead, you should try to keep your goals private. Something that _can_ help is having a specific accountability buddy, who will help you make sure that you’re progressing.

However, that person should not just provide mindless positive reinforcement. Instead, they should help you track your progress and help ensure that you’re on the right path.

**Tip #4 - Visualization**

If you’re lacking in motivation to work on your goal, a useful technique can be to spend some time visualizing failure and the negative consequences of not reaching your goal. This can help release neurochemicals like epinephrine, norepinephrine and dopamine that help you become more motivated.

If you’re _already_ highly motivated, then spending time visualizing the positive outcome of when you reach your goal can help you. This can help you maintain your motivation.

**Tip #5 - Random Rewards**

One key finding in behavioral psychology is the idea of using _unpredictable rewards_.

This is where you enforce a certain behavior by _randomly_ rewarding yourself when you accomplish it. Casinos take advantage of this trait when designing slot machines and other gambling games.

Whenever you successfully accomplish a task, then rewarding yourself in some small way can help motivate you to continue. However, you should set these rewards to be _random._

Every time you complete a 5 mile run, you might reward yourself with an oreo. Rather than giving yourself the oreo every time, flip a coin after each successful run. If the coin is heads, then you can take the oreo. If tails, then you don’t reward yourself.

For all the tips, check out the full video [here](https://youtu.be/CrtR12PBKb0?utm_source=blog.quastor.org&utm_medium=referral&utm_campaign=why-netflix-integrated-a-service-mesh-in-their-backend).

|     |
| --- |
| ### How did you like this summary?<br>Your feedback really helps me improve curation for future emails. Thanks! |
| - [I didn't like it](https://blog.quastor.org/login)<br>- [Mehh, it was okay](https://blog.quastor.org/login)<br>- [It was great](https://blog.quastor.org/login) |
| [Login](https://blog.quastor.org/login) or [Subscribe](https://blog.quastor.org/subscribe) to participate in polls. |

Twitter Widget Iframe
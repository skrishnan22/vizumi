[![Language Models & Co.](https://substackcdn.com/image/fetch/$s_!9c7j!,w_80,h_80,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9f9add91-c08f-4d73-a12b-3fdc2a6bc4f0_1280x1280.png)](https://newsletter.languagemodels.co/)

# [Language Models & Co.](https://newsletter.languagemodels.co/)

SubscribeSign in

![User's avatar](https://substackcdn.com/image/fetch/$s_!OP_O!,w_64,h_64,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad47920c-6ba0-4b61-a980-302ca426ee2e_400x400.jpeg)

Discover more from Language Models & Co.

Large language models, their internals, and applications.

Over 30,000 subscribers

Subscribe

By subscribing, I agree to Substack's [Terms of Use](https://substack.com/tos), and acknowledge its [Information Collection Notice](https://substack.com/ccpa#personal-data-collected) and [Privacy Policy](https://substack.com/privacy).

Already have an account? Sign in

# LLM Tokenizers, Semantic Search Course, And book update \#2

### Let me tell you what large language model Tokenizers are, why they're fascinating, and how they're are under-explored.

[![Jay Alammar's avatar](https://substackcdn.com/image/fetch/$s_!OP_O!,w_36,h_36,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad47920c-6ba0-4b61-a980-302ca426ee2e_400x400.jpeg)](https://substack.com/@jayalammar)

[Jay Alammar](https://substack.com/@jayalammar)

Nov 13, 2023

70

5

Share

Hi there, Jay here again with updates from LLM land!

I’ve recently put together a bunch of videos and collaborated with some of my ML heros to create a course about semantic search with LLMs on Deeplearning AI. Here’s a run down of them, and and update about our upcoming book.

Thanks for reading Language Models and Machine Learning! Subscribe for free to receive new posts and support my work.

Subscribe

## **Video: [ChatGPT has Never Seen a SINGLE Word (Despite Reading Most of The Internet). Meet LLM Tokenizers](https://youtu.be/uSinkCeUg9U?si=TXC27GW0HXiEjcL9)**

> Despite processing internet-scale text data, large language models never see words as we do. Yes, they consume text, but another piece of software called a tokenizer is what actually takes in the text and translates it into a different format that the language model actually operates on. In this video, Jay goes examines a language model tokenizer to give you a sense of how they work.

ChatGPT has Never Seen a SINGLE Word (Despite Reading Most of The Internet). Meet LLM Tokenizers. - YouTube

[Photo image of Jay Alammar](https://www.youtube.com/channel/UCmOwsoHty5PrmE-3QhUBfPQ?embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

Jay Alammar

62.6K subscribers

[ChatGPT has Never Seen a SINGLE Word (Despite Reading Most of The Internet). Meet LLM Tokenizers.](https://www.youtube.com/watch?v=uSinkCeUg9U)

Jay Alammar

Search

Watch later

Share

Copy link

Info

Shopping

Tap to unmute

If playback doesn't begin shortly, try restarting your device.

More videos

## More videos

You're signed out

Videos you watch may be added to the TV's watch history and influence TV recommendations. To avoid this, cancel and sign in to YouTube on your computer.

CancelConfirm

Share

Include playlist

An error occurred while retrieving sharing information. Please try again later.

[Watch on](https://www.youtube.com/watch?v=uSinkCeUg9U&embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

0:00

0:00 / 15:12

•Live

•

## Video: **[What makes LLM tokenizers different from each other? GPT4 vs. FlanT5 Vs. Starcoder Vs. BERT and more](https://youtu.be/rT6wVLEDC_w?si=kdaR_PAb2RXUFywD)**

> One of the best ways to understand what tokenizers do is to compare the behavior of different tokenizers. In this video, Jay takes a carefully crafted piece of text (that contains English, code, indentation, numbers, emoji, and other languages) and passes it through different trained tokenizers to reveal what they succeed and fail at encoding, and the different design choices for different tokenizers and what they say about their respective models.

What makes LLM tokenizers different from each other? GPT4 vs. FlanT5 Vs. Starcoder Vs. BERT and more - YouTube

[Photo image of Jay Alammar](https://www.youtube.com/channel/UCmOwsoHty5PrmE-3QhUBfPQ?embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

Jay Alammar

62.6K subscribers

[What makes LLM tokenizers different from each other? GPT4 vs. FlanT5 Vs. Starcoder Vs. BERT and more](https://www.youtube.com/watch?v=rT6wVLEDC_w)

Jay Alammar

Search

Watch later

Share

Copy link

Info

Shopping

Tap to unmute

If playback doesn't begin shortly, try restarting your device.

More videos

## More videos

You're signed out

Videos you watch may be added to the TV's watch history and influence TV recommendations. To avoid this, cancel and sign in to YouTube on your computer.

CancelConfirm

Share

Include playlist

An error occurred while retrieving sharing information. Please try again later.

[Watch on](https://www.youtube.com/watch?v=rT6wVLEDC_w&embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

0:00

0:00 / 14:13

•Live

•

## Course: **[New course with Cohere: Large Language Models with Semantic Search](https://youtu.be/Sh4n0uk-NHk?si=-C3ZYJTk2Z1CkB0u)**

It was incredible to collaborate with my heros, Luis Serrano, Meor Amer, and Andrew Ng on this short course. Enrol here: [https://bit.ly/3OLOEzo](https://bit.ly/3OLOEzo)

> Here's what you can expect:
>
> \- Understand LLM Fundamentals: Deepen your understanding of how large language models work, equipping you to become a more proficient AI builder.
>
> \- Enhance Keyword Search: Learn to integrate ReRank, a tool that boosts the quality of keyword or vector search systems without overhauling existing frameworks.
>
> \- Leverage Dense Retrieval: Discover how to use embeddings and large language models to enhance Q&A capabilities in your search applications.
>
> \- Evaluate and Implement: Gain insights into evaluating your search models and efficiently implementing these techniques in your projects.
>
> \- Real-World Application: Work with the Wikipedia dataset to understand how to optimize processes like retrieval and nearest neighbors, providing practical experience with large data sets.
>
> By the end of the course, you will gain a deeper understanding of the fundamentals of how Large Language Models (LLMs) work, enhancing your skills as an AI developer.

New course with Cohere: Large Language Models with Semantic Search - YouTube

[Photo image of DeepLearningAI](https://www.youtube.com/channel/UCcIXc5mJsHVYTZR1maL5l9w?embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

DeepLearningAI

468K subscribers

[New course with Cohere: Large Language Models with Semantic Search](https://www.youtube.com/watch?v=Sh4n0uk-NHk)

DeepLearningAI

Search

Watch later

Share

Copy link

Info

Shopping

Tap to unmute

If playback doesn't begin shortly, try restarting your device.

More videos

## More videos

You're signed out

Videos you watch may be added to the TV's watch history and influence TV recommendations. To avoid this, cancel and sign in to YouTube on your computer.

CancelConfirm

Share

Include playlist

An error occurred while retrieving sharing information. Please try again later.

[Watch on](https://www.youtube.com/watch?v=Sh4n0uk-NHk&embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

0:00

0:00 / 2:49

•Live

•

## **Book update**

[![Hands-On Large Language Models](https://substackcdn.com/image/fetch/$s_!1yOa!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F40f6a39a-fd2f-444b-b838-62dbeb5a6a28_400x525.jpeg)](https://substackcdn.com/image/fetch/$s_!1yOa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F40f6a39a-fd2f-444b-b838-62dbeb5a6a28_400x525.jpeg)

We are working hard on writing **[Hands-On Large Language Models](https://learning.oreilly.com/library/view/hands-on-large-language/9781098150952/)**. It is currently on Early Release on the O’Reilly platform with five chapters (150 pages) available now:

1\. Categorizing Text

2\. Semantic Search

3\. Text Clustering And Topic Modeling

4\. Multimodal Large Language Models

5\. Tokens & Token Embeddings

Access the Early Release version of the book with a 30-day free trial: [https://learning.oreilly.com/get-learning/?code=HOLLM23](https://learning.oreilly.com/get-learning/?code=HOLLM23)

### **Coming up next to the book: The Illustrated Transformer Revisited**

Maarten (my co-author) and I have a bunch of chapters in review that are not yet in the Early Release but should be coming in the next few weeks. The one I just finished is titled “ **A Look Inside Transformer LLMs**”. It’s basically revisiting The Illustrated Transformer with the major updates to The Transformer Architecture in the last five years. But it’s focused on text generation LLMs (autoregressive models generating one token at a time).

That chapter contains 39 new figures and I believe explains self-attention in the clearest formulation I know of. Here are some teaser visuals:

[![](https://substackcdn.com/image/fetch/$s_!Jhw1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2ea2e767-bfca-46c7-8ad1-8e4f706aad9f_2102x1186.png)](https://substackcdn.com/image/fetch/$s_!Jhw1!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2ea2e767-bfca-46c7-8ad1-8e4f706aad9f_2102x1186.png)

The two major steps for self-attention

[![](https://substackcdn.com/image/fetch/$s_!L7N2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d371a0a-e052-4c51-aee6-1efc0e439a0d_1996x1240.png)](https://substackcdn.com/image/fetch/$s_!L7N2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4d371a0a-e052-4c51-aee6-1efc0e439a0d_1996x1240.png)

The queries, keys, values of multi-head self-attention

[![](https://substackcdn.com/image/fetch/$s_!vdXP!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7b00fe07-7d16-41b8-acc7-4b59ed5ce3f1_1916x1158.png)](https://substackcdn.com/image/fetch/$s_!vdXP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7b00fe07-7d16-41b8-acc7-4b59ed5ce3f1_1916x1158.png)

The more efficient multi-query attention — heads have their individual queries but share keys and values. (Paper: [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150))

[![](https://substackcdn.com/image/fetch/$s_!harv!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4effa163-01e9-4a13-bf67-035fe232957d_1426x1022.png)](https://substackcdn.com/image/fetch/$s_!harv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4effa163-01e9-4a13-bf67-035fe232957d_1426x1022.png)

Transformer adapters are one approach to efficient fine-tuning

[![](https://substackcdn.com/image/fetch/$s_!exlG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6c7ca54d-036c-4669-aeba-9e94544b75d6_2800x2092.png)](https://substackcdn.com/image/fetch/$s_!exlG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6c7ca54d-036c-4669-aeba-9e94544b75d6_2800x2092.png)

Low-Rank adaptation, or LoRA is another method of efficient fine-tuning that relies on reducing large weight matrices to smaller, lower-rank matrices which are often able to compress the size and required storage/memory/compute while maintaining close performance. It works because language models “ [have a very low intrinsic dimension](https://arxiv.org/abs/2012.13255)”. So an efficient version of a 175B model can do a lot with rank = 8, for example. That vastly reduces the size of the matrix and the time needed to fine-tune those parameters

## Video: **[Introducing KeyLLM - Keyword Extraction with Mistral 7B and KeyBERT](https://www.youtube.com/watch?v=xF2UJTmRU_Y)**

Maarten, my co-author, has been creating some excellent LLM software and videos that explain them.

> In this video, I'm proud to introduce KeyLLM, an extension to KeyBERT for extracting keywords with Large Language Models! We will use the incredible Mistral 7B LLM and go through several use cases.

Introducing KeyLLM - Keyword Extraction with Mistral 7B and KeyBERT - YouTube

[Photo image of Maarten Grootendorst](https://www.youtube.com/channel/UCewHz0nV5-F05-2lEHkm4EQ?embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

Maarten Grootendorst

7.74K subscribers

[Introducing KeyLLM - Keyword Extraction with Mistral 7B and KeyBERT](https://www.youtube.com/watch?v=xF2UJTmRU_Y)

Maarten Grootendorst

Search

Watch later

Share

Copy link

Info

Shopping

Tap to unmute

If playback doesn't begin shortly, try restarting your device.

More videos

## More videos

You're signed out

Videos you watch may be added to the TV's watch history and influence TV recommendations. To avoid this, cancel and sign in to YouTube on your computer.

CancelConfirm

Share

Include playlist

An error occurred while retrieving sharing information. Please try again later.

[Why am I seeing this?](https://support.google.com/youtube/answer/9004474?hl=en)

[Watch on](https://www.youtube.com/watch?v=xF2UJTmRU_Y&embeds_referring_euri=https%3A%2F%2Fnewsletter.languagemodels.co%2F)

0:00

0:00 / 18:52

•Live

•

…

That’s it for this update. Still a bunch more exciting things coming up I can’t tell you about just yet, so stay tuned!

Thanks for reading Language Models and Machine Learning! Subscribe for free to receive new posts and support my work.

Subscribe

[![Toshiko's avatar](https://substackcdn.com/image/fetch/$s_!3HX-!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1450f248-cc0e-4213-9c67-92485d2dac20_144x144.png)](https://substack.com/profile/29442021-toshiko)[![Sandra's avatar](https://substackcdn.com/image/fetch/$s_!Eln3!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2f02cde0-9db3-4eaa-8261-1b28df59e63f_144x144.png)](https://substack.com/profile/3572501-sandra)[![WvG's avatar](https://substackcdn.com/image/fetch/$s_!wIog!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F34b6f50e-88e9-46e2-b473-d1b60713ae0f_300x386.jpeg)](https://substack.com/profile/27977606-wvg)[![Adi Pradhan's avatar](https://substackcdn.com/image/fetch/$s_!ybii!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6947b805-6bd0-4115-9763-ce7e5879e86e_1977x1977.jpeg)](https://substack.com/profile/301044-adi-pradhan)[![Madan Kumar Y's avatar](https://substackcdn.com/image/fetch/$s_!KRmW!,w_32,h_32,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd17ef447-c4da-439e-ab8d-a2407e2458b2_144x144.png)](https://substack.com/profile/51267156-madan-kumar-y)

70 Likes∙

[5 Restacks](https://substack.com/note/p-138803547/restacks?utm_source=substack&utm_content=facepile-restacks)

70

5

Share

TopLatestDiscussions

[The Illustrated DeepSeek-R1](https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1)

[A recipe for reasoning LLMs](https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1)

Jan 27•[Jay Alammar](https://substack.com/@jayalammar)

764

24

41

![](https://substackcdn.com/image/fetch/$s_!fn53!,w_320,h_213,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_center/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F623a9dbf-c76e-438c-ba69-43ae9613ebbe_2930x1496.png)

[The Illustrated GPT-OSS](https://newsletter.languagemodels.co/p/the-illustrated-gpt-oss)

[OpenAI releases their first open source LLM in six years](https://newsletter.languagemodels.co/p/the-illustrated-gpt-oss)

Aug 19•[Jay Alammar](https://substack.com/@jayalammar)

151

7

14

![](https://substackcdn.com/image/fetch/$s_!Mw5k!,w_320,h_213,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_center/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fef7bcc2e-e402-4a79-ad3e-de80689b1617_1616x814.png)

[Inside NeurIPS 2025: The Year’s AI Research, Mapped](https://newsletter.languagemodels.co/p/the-illustrated-neurips-2025-a-visual)

[Using Cohere's Command A Reasoning and Embed 4 to Visualize the ~6,000 Papers Accepted to NeurIPS 2025](https://newsletter.languagemodels.co/p/the-illustrated-neurips-2025-a-visual)

Nov 3•[Jay Alammar](https://substack.com/@jayalammar)

129

6

15

![](https://substackcdn.com/image/fetch/$s_!U7b0!,w_320,h_213,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_center/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff97e6238-a10c-4886-ae53-e7fc51f4bcf3_1832x1160.png)

See all

### Ready for more?

Subscribe